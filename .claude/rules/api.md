---
paths:
  - "src/app/api/**"
  - "src/lib/**"
---

## API Route Conventions (Next.js App Router)

File location: `src/app/api/[resource]/route.ts`
Export named HTTP method handlers: `GET`, `POST`, `PUT`, `DELETE`

## Response Contract

Every API response follows this shape:

```ts
// Success
{ data: T, error: null }

// Error
{ data: null, error: { message: string, code: string } }
```

Always use `NextResponse.json()` with appropriate HTTP status codes.

## Anthropic API (Chatbot Route)

- Route: `src/app/api/chat/route.ts`
- Model: `claude-sonnet-4-6`
- API key: `process.env.ANTHROPIC_API_KEY` — NEVER expose to client
- Stream responses using Vercel AI SDK or native streaming
- Validate and sanitize all user messages before sending to API
- Rate limit: implement basic rate limiting on the chat endpoint

## Error Handling

- Every async operation must have try/catch
- Return structured errors — never leak stack traces to client
- Log errors server-side only

## Input Validation

- Validate all request bodies before processing
- Return 400 with descriptive error for bad inputs
- Never pass raw user input to database queries or external APIs
