# 09 — CONTACT, RESUME DOWNLOAD & FREELANCE

## Contact page (`/contact`)
- The globe (`remix-blue-marble-globe`, tweaked per `04`): hover reveals the "drag to orbit / scroll to zoom" hint; Rotation/Time readout kept; no emoji/label; JetBrains Mono.
- Honest framing only: a marker on India + "remote-first, available to work with teams globally." **No deployment markers / no "clients worldwide" dots** (fabrication).
- Contact info from `content/contact.md`: email (niranjan.vsks@gmail.com), LinkedIn, GitHub, site.
- The globe stays off the landing page (it competes with the hero). Contact only.

## Resume download (V1 feature)
- Prominent **"Download Résumé (PDF)"** CTA: in the top nav AND on `/contact` and `/about`.
- Links to `public/NIRANJAN_VSKS_Resume.pdf` (the current FDE-positioned export). Opens/downloads directly.
- Keep the file path stable so Niranjan can drop in updated PDFs without code changes.

## Freelance positioning (strategic)
- The **main profile stays 100% FDE-pure.** No freelance/agency signals anywhere on the public portfolio surfaces (they would read as flight-risk to FDE recruiters).
- Optional **`/work-with-me`** page, `noindex` (robots meta + not in sitemap/nav): a lightweight freelance services page reachable only via a direct link Niranjan shares in cold outreach. Lean: one services blurb, how-to-engage, contact. Build only if quick; it is not a V1 priority.

## NOT in V1
The recruiter "select company + role → generate what I'd build" report. Parked for V2/V3, and only with the role list trimmed to FDE / Senior Agentic AI Engineer and an honest, framework-driven (non-hallucinating) generation approach.
