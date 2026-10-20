# Middlewares

| Fichier | Rôle |
|---------|------|
| `validate.middleware.ts` | `validateBody(schema)` : valide `req.body` avec un schéma Zod, renvoie `400` sinon |
| `error.middleware.ts` | Handler d'erreur centralisé : formate la réponse à partir d'une `AppError`, ou renvoie un `500` générique |
| `rateLimiter.middleware.ts` | `clickLimiter` (60 req/min/IP sur `/words/:id/increase`), `createWordLimiter` (10 req/15 min/IP sur `POST /words`) |

Les limiteurs s'appuient sur l'IP client, d'où le `app.set("trust proxy", 1)` dans `main.ts` (derrière Traefik).
