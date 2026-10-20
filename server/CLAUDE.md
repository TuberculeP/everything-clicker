# Backend

> Express REST API under `/api` + Socket.io, TypeORM `Word` entity, live top 10 broadcast. Public: no auth, no sessions.

Boot (`src/main.ts`): DB init -> migrations **only if production and Postgres** -> `trust proxy` + helmet + json -> `/api` router -> `errorHandler` -> Vite middleware (dev) or static `dist/client` (prod) -> Socket.io (`setIo`).

## Architecture

```
src/
  main.ts                       # boot sequence above
  config/
    db.config.ts                # DataSource: Postgres if POSTGRES_URL, else SQLite
    entities/index.ts           # entity registry (Word)
    entities/Word.ts            # id uuid, word varchar(64), count int (indexed), timestamps
  routes/
    index.ts                    # mounts /words
    words/                      # list, top, get, create, increase (+ Zod schemas)
  services/topWords.service.ts  # getTopWords(), setIo(), broadcastTopWords() (throttled)
  middleware/                   # validate, error, rateLimiter (see README.md)
  utils/
    AppError.ts                 # new AppError(message, statusCode = 400)
    asyncHandler.ts             # forwards async errors to errorHandler
  events/
    event_handler.ts            # WebSocket event registry
    words.event.ts              # "words" { action: "top" } -> emits "words:top" to the caller
  migrations/                   # Postgres migrations (prod only)
__tests__/                      # Jest (ts-jest, server/tsconfig.json)
```

## API

| Method | Route | Notes |
|--------|-------|-------|
| GET | `/api/words` | all words, oldest first |
| GET | `/api/words/top` | `TopWord[]` (`{ id, word, count, rank }`, 10 max) |
| GET | `/api/words/:id` | 404 if unknown or malformed uuid |
| POST | `/api/words` | `{ word }` (trimmed, 1..64), `createWordLimiter`, 201 + created word |
| POST | `/api/words/:id/increase` | `{ amount }` int >= 1, `clickLimiter`; `amount > 250` -> 400 `no_auto_click`; returns the updated word |

Socket.io: server emits `words:top` (`TopWord[]`) to everyone after each create/increase, and to a single client when it emits `words` with `{ action: "top" }`.

## Response formats

- Errors: `{ message }` (AppError, chosen status), `{ message: "Validation failed", errors }` (400, Zod issues), `{ message: "Internal server error" }` (500).
- Success: no envelope, plain JSON.

## Add a route

1. `routes/<x>/<x>.schemas.ts`: Zod schemas.
2. `routes/<x>/index.ts`: `Router()`, a limiter if it writes, `validateBody(schema)`, handler wrapped in `asyncHandler`, `throw new AppError(msg, status)` for business errors.
3. Mount it in `routes/index.ts`: `router.use("/<x>", xRouter)`.

## Add an entity

1. `config/entities/X.ts` (uuid primary key, like `Word.ts`).
2. Add it to the array in `config/entities/index.ts` (not in `db.config.ts`).
3. Dev schema auto-syncs. For prod, generate a migration against a reachable Postgres (e.g. `npm run dockerize`, port 5432 is published locally), from Git Bash: `TS_NODE_PROJECT=server/tsconfig.json POSTGRES_URL=... npx typeorm-ts-node-commonjs migration:generate -d server/src/config/db.config.ts server/src/migrations/<Name>`. Same for `migration:run` / `migration:revert`.

## Add a WebSocket event group

1. `events/<x>.event.ts` exporting an `EventGroup`: `{ default: handler, <name>: handler }`, handler signature `({ event, data, ws }) => void`.
2. Register it in `eventGroupList` in `events/event_handler.ts` under key `<x>`. `default` listens on `<x>`, the others on `<x>:<name>`.
3. To push from a route, keep the `Server` from `setIo()` pattern (`services/topWords.service.ts`) rather than importing `main.ts`.

## Gotchas

- SQLite always uses `synchronize: true`: migrations are written for Postgres. Never run migrations against SQLite.
- Prod has `synchronize: false`: forgetting a migration after an entity change means missing columns in prod only.
- `app.set("trust proxy", 1)` is needed behind Traefik: without it the rate limiters key on the proxy IP and throttle everyone together. Don't remove it, and raise it if another proxy hop is added.
- `broadcastTopWords()` is lodash-throttled (1/s, leading + trailing): don't `await` it, and don't call `io.emit("words:top")` directly from routes.
- The 250 clicks per batch limit matches the front's 2s batch (`webapp/src/composables/useClickBatch.ts`). Change both together.
- Malformed ids are rejected before querying (`UUID_REGEX` in `routes/words/index.ts`): Postgres throws on an invalid uuid, which would be a 500.
- `errorHandler` logs the error but not `req.body`. Keep it that way.
