# Architecture · National Census Digital Assistant (HPE)

The deployed Azure architecture, as walked on /system-design.

## Shape
Citizens reach the assistant through web and mobile. Azure Front Door with WAF absorbs national-scale bursts during census windows; all backend traffic passes through Azure API Management with scoped subscriptions and throttling. A conversation orchestrator (bot service on App Service) routes intent between two very different worlds:

- **FAQ RAG** (Azure AI Search + LLM): grounded answers over census guidelines with guardrails and refusal paths. The assistant never speculates on civic policy.
- **Transactional flows** (deterministic state machines): NPR registration and birth/death reporting with strict field validation, receipts, and a full audit trail. The LLM assists with language; it never writes records.

## Data and trust
- Central government registry APIs sit behind APIM as a managed, audited contract.
- Session and case state in a Cosmos DB-class store so multi-step registrations survive disconnects; minimal PII, purged on completion.
- Key Vault + managed identities for registry credentials; Azure Monitor with an audit trail on every transactional step.
- Multilingual layer: intent detection and responses in the citizen's own language.

## Tradeoffs I defend
State machines over generative flows for records (validation beats fluency), APIM as a hard boundary (one extra hop, full auditability), and Azure-native managed services because the deployment context made the ecosystem the pragmatic call.
