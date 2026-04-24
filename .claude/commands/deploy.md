---
name: deploy
---

Pre-deployment checklist — all must pass before deploying to Vercel:

1. Run full type-check: `npx tsc --noEmit` — zero errors
2. Run lint: `npm run lint` — zero errors
3. Run build: `npm run build` — zero errors, zero warnings
4. Invoke security-auditor agent — zero CRITICAL issues
5. Verify ANTHROPIC_API_KEY is in Vercel env vars, NOT committed to git
6. Confirm zero console.log in production code
7. Confirm all API route responses follow project contract: `{ data, error }`
8. Check bundle size hasn't increased unexpectedly

Report: READY TO DEPLOY or list of blocking issues.
Do not deploy if any check fails.
