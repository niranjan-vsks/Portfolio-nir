# Architecture · Loop Copilot (production scale)

The production-scale architecture Loop Copilot grows into past its Fortune 500 pilot, as walked on /system-design. Azure-native because the product lives inside Microsoft tenants; sized for ~1,000 concurrent users at launch.

## Shape
Web (React 19) and Telegram clients enter through Azure Front Door + WAF into autoscaled async FastAPI containers. Entra ID (MSAL) keeps auth inside the customer's tenant trust model; Azure Key Vault resolves all secrets at runtime via managed identity.

## Memory: event sourcing over vector RAG
An append-only event store (Cosmos DB, Mongo API) records workflow events; a context assembler injects live events, account portfolio, and recent history per request as structured JSON. More tokens per request, hallucinated memory eliminated. The LLM (Groq/Llama today) sits behind an abstraction so tenant-compliant Azure OpenAI can swap in per customer.

## Scale plumbing
- Service Bus queues isolate bulk uploads and voice-call transcription from the interactive path (sub-second p95 target).
- Redis holds session context and per-user rate limits.
- App Insights + Telegram alerts give admins live adoption visibility.

## CRM integration: three tiers in the tenant trust model
Power Automate flows (primary, tenant-native identity), direct Dataverse REST via MSAL (secondary), browser session fallback (tertiary), landing in D365 behind a multi-CRM shell (Salesforce, HubSpot, Zoho slots architected). Complexity traded for cross-environment portability from day one.
