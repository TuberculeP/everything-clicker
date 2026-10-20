# Everything Clicker

> Public clicker: anyone creates a word and clicks it, a live top 10 is pushed to every visitor. No accounts.

Full-stack TypeScript: Express + TypeORM + Socket.io / Vue 3 + Pinia + vue-i18n / Tailwind v4 + shadcn-vue + xp.css + three.js. Postgres (SQLite fallback in dev). Single app on http://localhost:3000: Vite runs as Express middleware, there is no separate Vite dev server.

## Structure

```
server/src/     # Express API + WebSocket (see server/CLAUDE.md)
webapp/src/     # Vue 3 SPA (see webapp/CLAUDE.md)
webapp/public/  # audio/ (music), img/ (retro gifs), served at / by Vite
docker/         # pgadmin/servers.json (preregistered server)
docs/           # RGPD-CHECKLIST.md
```

## Module docs

| Module | File | Content |
|--------|------|---------|
| Backend | `server/CLAUDE.md` | Routes, entity, migrations, top words broadcast, WebSocket |
| Frontend | `webapp/CLAUDE.md` | Router, apiClient, stores, click batching, 3D scene, i18n, design system |

## Commands (from root)

```bash
npm run dev          # server + webapp, hot reload
npm run build        # tsc server + vite build -> dist/
npm start            # run the production build
npm test             # Jest (server only)
npm run lint         # ESLint + Prettier (also lint:webapp / lint:server)
npm run dockerize    # Postgres + pgAdmin + app via Docker Compose (local ports)
```

Windows: `npm start` and `migration:*` use POSIX `VAR=x cmd` syntax and fail under cmd.exe (npm runs scripts through cmd even from Git Bash). Run the underlying command directly from Git Bash.

## Environment

`.env.example` is the source of truth. Without `POSTGRES_URL`, the app falls back to SQLite (`sqlite.db`).

Docker: `docker-compose.yml` publishes no port (deployed with Coolify/Traefik, which route domains to the internal ports: app 3000, pgAdmin 80). `docker-compose.local.yml` publishes them locally (3000, 5432, pgAdmin on 5050).

## Conventions

- Vue: `<script setup lang="ts">`, Pinia stores in Composition API style
- HTTP from the front: always `apiClient` (returns `{ data, error }`, never throws)
- Backend: Zod schema + `validateBody`, handlers wrapped in `asyncHandler`, business errors via `throw new AppError(msg, status)`
- Icons: `lucide-vue-next`, no emoji in code, UI, commits or logs
- UI strings: through i18n (`webapp/src/lib/lang/`)

## Verification

CI runs `lint` and `build` on push, so both must pass. Check with `npm run lint`, `npm run build` and `npx vue-tsc --noEmit -p webapp/tsconfig.json`. `npm test` only contains a placeholder test. The user tests changes manually in the browser: do not start the dev server, write e2e scripts or take screenshots unless asked.

## Maintaining CLAUDE.md files

Local CLAUDE.md files only load when a file in their folder is read, so this root file must stay short and point to them.

- Changing a module means updating its CLAUDE.md in the same change.
- A non-trivial new module (its own store + composables + several components, or logic with traps) gets its own `<folder>/CLAUDE.md` and a row in the table above.
- Template: `# Title` + `> one-line purpose`, `## Architecture` (tree: file -> role), `## API` (TS signatures only), `## Add a <X>` (numbered steps), `## Gotchas` (real traps + why).
- Never repeat what a parent CLAUDE.md already says. No copied code, no roadmap or bug checklists. Anything needed *before* entering a folder (e.g. "check existing components") goes in the parent file. Write in English.
