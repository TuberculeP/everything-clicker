# Config

| Fichier | Rôle |
|---------|------|
| `db.config.ts` | DataSource TypeORM : Postgres si `POSTGRES_URL` est défini, sinon fallback SQLite en dev. `synchronize` seulement hors production. En prod, le schéma passe par les migrations (`server/src/migrations/`). |
| `entities/` | Entités TypeORM (`Word`) |

Voir aussi [docs/RGPD-CHECKLIST.md](../../../docs/RGPD-CHECKLIST.md) (sauvegardes, accès pgAdmin).
