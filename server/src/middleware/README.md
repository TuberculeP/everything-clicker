# Middlewares

| Fichier | Rôle |
|---------|------|
| `validate.middleware.ts` | `validateBody(schema)` : valide `req.body` avec un schéma Zod, renvoie `400` sinon |
| `error.middleware.ts` | Handler d'erreur centralisé : formate la réponse à partir d'une `AppError`, ou renvoie un `500` générique |
| `rateLimiter.middleware.ts` | `clickLimiter` (60 req/min/IP sur `/words/:id/increase`), `createWordLimiter` (10 req/15 min/IP sur `POST /words`) |
| `clickBudget.middleware.ts` | `clickBudget` : budget de clics par IP (seau de 250 clics, rechargé à 125 clics/s), chaque requête `/increase` consomme son `amount`. `amount > 250` -> `400 no_auto_click`, budget dépassé -> `429 no_auto_click`. À placer après `validateBody` |

Les limiteurs s'appuient sur l'IP client, d'où le `app.set("trust proxy", 1)` dans `main.ts` (derrière Traefik).
