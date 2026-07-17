import { retrieve } from "@/lib/rag/retrieve";
import { buildSystemPrompt, FALLBACK } from "@/lib/rag/persona";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const GEMINI_OPENAI_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

interface Provider {
  name: "gateway" | "gemini" | "groq";
  url: string;
  key: string;
  model: string;
}

/**
 * Choose the chat provider. Preference: Vercel AI Gateway (routing to Gemini by
 * default) -> Gemini API directly -> Groq. All three speak the OpenAI-compatible
 * streaming shape, so the SSE parser below is shared. Override the model with
 * CHAT_MODEL (e.g. a specific Gemini 3 id on the gateway).
 */
function pickProvider(): Provider | null {
  const gw = process.env.AI_GATEWAY_API_KEY_NIR ?? process.env.AI_GATEWAY_API_KEY;
  if (gw)
    return { name: "gateway", url: GATEWAY_URL, key: gw, model: process.env.CHAT_MODEL ?? "google/gemini-2.5-flash" };
  const gemini = process.env.GEMINI_API_KEY;
  if (gemini)
    return { name: "gemini", url: GEMINI_OPENAI_URL, key: gemini, model: process.env.CHAT_MODEL ?? "gemini-2.5-flash" };
  const groq = process.env.GROQ_API_KEY;
  if (groq) return { name: "groq", url: GROQ_URL, key: groq, model: GROQ_MODEL };
  return null;
}

function groqFallback(): Provider | null {
  const groq = process.env.GROQ_API_KEY;
  return groq ? { name: "groq", url: GROQ_URL, key: groq, model: GROQ_MODEL } : null;
}

function streamChat(provider: Provider, system: string, messages: Msg[]) {
  return fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      stream: true,
      temperature: 0.4,
      messages: [{ role: "system", content: system }, ...messages.slice(-6)],
    }),
  });
}

function sse(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

// Basic in-memory rate limiter (PRD 6.9 / decision #5): 15 requests / minute / IP.
const WINDOW_MS = 60_000;
const MAX_REQ = 15;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQ;
}

/** Stream plain text chunks. Works with or without GROQ_API_KEY (bullseye/08). */
export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    logger.warn("api/ask", "rate limited", { ip });
    return new Response("Too many requests. Give me a moment.", { status: 429 });
  }

  let body: { messages?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query = lastUser?.content ?? "";
  const context = retrieve(query, 5);
  const system = buildSystemPrompt(context);

  const provider = pickProvider();
  logger.debug("api/ask", "query received", {
    query,
    chunks: context.length,
    sources: context.map((c) => c.source),
    mode: provider?.name ?? "mock",
  });

  // ---- Mock path: no key configured. Stream grounded snippets or fallback. ----
  if (!provider) {
    const stream = new ReadableStream({
      async start(controller) {
        // TODO(niranjan): set GROQ_API_KEY in .env for the real Groq/Llama answer.
        let out: string;
        if (context.length === 0) {
          out = FALLBACK;
        } else {
          out =
            "Here is what I have on that, grounded in my own write-ups:\n\n" +
            context
              .slice(0, 2)
              .map((c) => c.text)
              .join("\n\n") +
            "\n\nWant to go deeper on any of this? Reach me at niranjan.vsks@gmail.com.";
        }
        for (const word of out.split(/(\s+)/)) {
          controller.enqueue(sse(word));
          await new Promise((r) => setTimeout(r, 12));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // ---- Real path: OpenAI-compatible streaming via the chosen provider
  // (Vercel AI Gateway -> Gemini by default), with Groq as the fallback. ----
  let active = provider;
  let upstream = await streamChat(active, system, messages);
  if ((!upstream.ok || !upstream.body) && active.name !== "groq") {
    const fb = groqFallback();
    if (fb) {
      logger.warn("api/ask", "primary upstream failed, falling back to groq", {
        provider: active.name,
        status: upstream.status,
      });
      active = fb;
      upstream = await streamChat(active, system, messages);
    }
  }

  if (!upstream.ok || !upstream.body) {
    logger.error("api/ask", "upstream error", { provider: active.name, status: upstream.status });
    return new Response("upstream error", { status: 502 });
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const token = json.choices?.[0]?.delta?.content;
            if (token) controller.enqueue(sse(token));
          } catch {
            /* ignore keep-alive / partial frames */
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
