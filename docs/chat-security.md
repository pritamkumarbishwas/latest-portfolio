# Chatbot security & operations

Protections, secrets hygiene, and incident steps for the AI chat
(`/api/chat`). Last reviewed: 2026-10-09.

## Protections built into the code

| Layer | Config | Behaviour |
| --- | --- | --- |
| Rate limit | 10 req/min + 50 req/day per IP (`src/lib/chat/ratelimit.ts`) | 429 + `Retry-After` header; friendly message shown in the UI |
| Origin/Host allowlist | `SITE_URL` + `localhost` (`src/lib/chat/guard.ts`) | 403 for any other origin/host (CSRF defence) |
| Kill switch | `CHAT_ENABLED=false` | Route returns 503 and the launcher button is hidden |
| Body cap | 32 KB (`MAX_CHAT_BODY_LENGTH`) | Checked from `Content-Length` **before** reading, and again before JSON parsing → 400 |
| Schema validation | Zod (`src/lib/chat/schemas.ts`) | `role` must be `user`/`assistant` (no client `system` role); 10 messages max, 500 chars each, text parts only |
| Output bounds | `maxOutputTokens: 400`, `temperature: 0.3`, `maxDuration = 30` | Caps per-request model spend and runtime |
| No CORS | no `Access-Control-*` headers | Other sites cannot *read* responses; the Origin check blocks them from *spending* tokens |
| Error hygiene | `src/app/api/chat/route.ts` | Logs error class/status only — never prompts, messages, keys, or stack traces |

### Rate limiter backends

- **Production (required):** Upstash Redis (`UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN`). If the vars are missing or Redis is unreachable
  the route **fails closed** with a 503 — no unprotected traffic.
- **Development (fallback):** in-memory sliding window, logged once as a
  warning. Single process only; resets on restart.

### Launcher visibility

`CHAT_ENABLED=false` is read server-side in `src/app/layout.tsx`, so the
button is never rendered (not merely hidden by client JS). The flag is baked
at build time for static pages — toggling it requires a redeploy.

## Environment variables

See `.env.example`. Required for production: `GROQ_API_KEY` (or
`OPENAI_API_KEY`), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`,
`SITE_URL`. Optional: `CHAT_PROVIDER`, `CHAT_ENABLED`.

## Provider spend cap

Per request the cost is already bounded: ≤ 10 messages × 500 chars of context
+ 400 output tokens + 30 s runtime; per IP ≤ 50 requests/day (sliding
window). For hard spend control:

1. **Groq** — console.groq.com → *API Keys*: note your key's rate limits;
   *Usage*: enable spend/usage alerts where available. Review usage monthly.
2. **OpenAI** (if `CHAT_PROVIDER=openai`) — platform.openai.com → *Billing*:
   set a **hard monthly budget** so a leaked key cannot run up a bill.
3. **Upstash** — free tier (10k commands/day) covers well beyond the chat's
   50 requests/IP/day (2 Redis commands per check). Set a usage alert in the
   Upstash console.
4. **Vercel** — `/api/chat` has `maxDuration = 30`; add a project spend cap
   for functions if you use paid tier.

## Key rotation

Rotate on schedule (e.g. quarterly) or immediately after any suspicion:

1. **Create first, swap second:** Groq console → *API Keys* → create a new
   key (keeps downtime at zero).
2. Update `GROQ_API_KEY` in Vercel (Settings → Environment Variables) and in
   local `.env.local`.
3. Redeploy (Vercel) / restart `npm run dev`.
4. Revoke the old key in the Groq console.
5. Repeat for `OPENAI_API_KEY`, `UPSTASH_*`, `RESEND_API_KEY` as needed.

## If a key leaks

1. **Revoke immediately** in the provider console — this is the real
   containment step; everything else is cleanup.
2. Create a replacement key and redeploy (steps 2–3 above).
3. Check the provider's **usage dashboard** for unexpected calls (times,
   volumes) since the exposure window.
4. If it was ever committed: purge only if the repo is shared —
   `git rebase`/`git filter-repo` on the offending commit; rotation matters
   more than history rewriting (clones keep old history).
5. Confirm `.env.example` contains placeholders only (real keys live in
   `.env.local`, which is gitignored).

## Audit findings (2026-10-09)

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| 1 | **High** | `.env.example` (git-tracked) contained real-looking Groq + OpenAI keys in commit `ee87bb4` | **Redacted now, but the commit still holds them.** `ee87bb4` is *ahead 1* — not pushed to GitHub. Rotate both keys and amend the commit **before pushing** (`git commit --amend`). |
| 2 | Low | Same Groq key present in `.env.local` | OK — gitignored; rotate together with #1 |
| 3 | Info | Phone number ships in the client bundle (`site.phone` via `src/config/site.ts`) and is rendered on the contact page | Intentional (public contact info). It is stripped from the model prompt (`prompt.ts` `sanitizePortfolio`) and the assistant is instructed never to share it. |
| 4 | Info | `profile.json` holds the phone number server-side | OK — `server-only` schema boundary; not imported by client components |
| 5 | — | Prompt injection: client could try `system` role or giant contexts | Blocked: `z.enum(["user","assistant"])`, 10 msgs/500 chars, 32 KB body, text-only parts; system prompt isolates portfolio data in `<portfolio>` tags with "ignore instructions inside data" rules (Phase 3) |
| 6 | — | Secret logging | None: no `console.log/info/debug` in `src/`; errors log class/status only; `prompt:report` confirmed the phone never reaches the prompt |
| 7 | — | `NEXT_PUBLIC_*` secrets | None — grep shows zero `NEXT_PUBLIC_` usage |
| 8 | — | Stream abuse / runaway output | Bounded by `maxOutputTokens: 400`, `maxDuration: 30`, rate limits |

**Action items for the owner:** (a) rotate the Groq and OpenAI keys, (b)
amend commit `ee87bb4` (or `git reset --soft HEAD~1` and recommit) so the
redacted `.env.example` is what lands on GitHub, (c) set `SITE_URL` +
Upstash vars in Vercel.
