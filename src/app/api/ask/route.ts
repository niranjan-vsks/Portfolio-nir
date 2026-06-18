import { retrieve } from "@/lib/rag/retrieve";
import { buildSystemPrompt, FALLBACK } from "@/lib/rag/persona";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

function sse(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/** Stream plain text chunks. Works with or without GROQ_API_KEY (bullseye/08). */
export async function POST(req: Request) {
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

  const apiKey = process.env.GROQ_API_KEY;
  logger.debug("api/ask", "query received", {
    query,
    chunks: context.length,
    sources: context.map((c) => c.source),
    mode: apiKey ? "groq" : "mock",
  });

  // ---- Mock path: no key configured. Stream grounded snippets or fallback. ----
  if (!apiKey) {
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
            "\n\n(Live answers use Groq/Llama once GROQ_API_KEY is set. Reach me at niranjan.vsks@gmail.com.)";
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

  // ---- Real path: Groq streaming, OpenAI-compatible. ----
  const groqRes = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        ...messages.slice(-6),
      ],
    }),
  });

  if (!groqRes.ok || !groqRes.body) {
    logger.error("api/ask", "groq upstream error", { status: groqRes.status });
    return new Response("upstream error", { status: 502 });
  }

  const reader = groqRes.body.getReader();
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
