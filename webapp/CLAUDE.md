# Frontend

> Vue 3 SPA served by Express (Vite middleware in dev, `dist/client` in prod). Retro look (xp.css, gifs, Comic Sans) on top of Tailwind + shadcn-vue. All API calls go to `/api`.

## Architecture

```
src/
  main.ts                   # createApp + router + i18n + pinia, imports assets/xp.css then assets/index.css
  App.vue                   # AppLayout + RouterView
  router.ts                 # / (home), /w/:id (word), catch-all 404. No guards
  layouts/AppLayout.vue     # header (AudioPlayer, title, joke dark mode), main + footer, aside TopWords, Toaster
  stores/
    wordsStore.ts           # words list, fetchWords, addWord
    topWordsStore.ts        # live top 10 from Socket.io + normalized values for the 3D scene
  composables/
    useClickBatch.ts        # local click counter, batch sent every 2s
  components/
    AudioPlayer.vue         # "mode Pro" music player (webapp/public/audio)
    TopWords.vue            # TopWordsScene (lazy) + ranking list
    TopWordsScene.vue       # three.js ring of spheres + CSS2D labels in an xp.css window
    ui/                     # shadcn-vue components (see Design system)
  views/                    # HomeView, WordView, NotFoundView
  lib/
    utils.ts                # cn()
    utils/apiClient.ts      # HTTP client
    utils/websocket.ts      # Socket.io client
    utils/types.ts          # Word, TopWord
    lang/                   # i18n: index.ts, fr.json, en.json
  assets/
    index.css               # Tailwind + theme tokens + @font-face (fonts/)
    xp.css                  # xp.css imported in layer(base)
```

Alias `@` -> `webapp/src`. Static files in `webapp/public/` are served at `/` (`/audio/...`, `/img/...`).

## API

```typescript
// lib/utils/apiClient.ts - never throws, error = server { message } if any, else Axios message
apiClient.get<T>(url, params?): Promise<{ data: T; error: null } | { data: null; error: string }>
apiClient.post|put|patch|delete<T>(url, data?, config?)  // FormData -> multipart automatically

// stores - use storeToRefs()
useWordsStore(): { words: Ref<Word[]>, fetchWords(), addWord(word): Promise<string | null> }  // null = ok
useTopWordsStore(): { top: Ref<TopWord[]>, normalized: ComputedRef<(TopWord & { value: number })[]> }

// composables/useClickBatch.ts
useClickBatch(id: Ref<string>): { word, notFound, pending, totalAtBatch, click() }

// lib/utils/websocket.ts
onSocketConnected(cb: (socket) => void)
onSocketEvent(event, cb): () => void   // returns unsubscribe
```

i18n: locale `fr`, fallback `en`, Composition mode (`useI18n()` / `$t`). A missing key returns the key itself and logs a warning.

## Add a page

1. Component in `views/`.
2. Lazy route in `router.ts`: `component: () => import("./views/...")`, with a `name`, declared before the catch-all.
3. Strings in `lib/lang/fr.json` and `en.json`.

## Design system

Tailwind v4 + shadcn-vue (style new-york, built on reka-ui) + xp.css for the retro widgets (`window`, `title-bar`, `tree-view`...). Theme tokens are HSL CSS variables in `assets/index.css` (`:root` + `@theme`), used through Tailwind classes (`bg-background`, `bg-clicker`, `font-title`...). Never hardcode colors (exception: three.js materials, which need a literal color).

Existing components (import from `@/components/ui/<name>`). Check this list before writing a component, and update it when adding one:

| Component | Exports |
|-----------|---------|
| `button` | `Button`, `buttonVariants`, `ButtonVariants` (class-variance-authority) |
| `card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` |
| `input` | `Input` |
| `sonner` | `Toaster`, `toast` (vue-sonner) |

- Add one: `npx shadcn-vue@latest add <name>` (configured by `components.json`). The CLI writes `@lucide/vue` and a wrong `cn` import, and uses `var(--x)` instead of `hsl(var(--x))`: fix those after generating.
- Merge classes with `cn()` from `@/lib/utils`.
- Icons: `lucide-vue-next`.

## Gotchas

- xp.css must stay in `assets/xp.css` with `layer(base)`. Imported from `index.css`, Tailwind inlines it without rebasing its font urls. Imported unlayered, its element styles beat every Tailwind utility.
- The "dark mode" in `AppLayout.vue` is a joke from the original site (it hides the page behind a gif), not a theme switch.
- `useClickBatch` subtracts the sent amount from `pending` instead of resetting it, so clicks made during the request are kept. The 2s interval matches the server's 250 per batch limit.
- `TopWordsScene.vue` owns the three.js objects outside Vue reactivity. Rebuild on `watch(normalized)` and dispose everything in `onBeforeUnmount`, or WebGL contexts leak on hot reload.
- `websocket.ts` connects at import time (websocket transport only). `onSocketConnected` fires once: `topWordsStore` re-requests the top on every later `connect`.
