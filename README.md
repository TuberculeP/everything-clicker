# Everything Clicker

Clicker public : chacun crée un mot et clique dessus, et un top 10 en direct (liste + scène 3D) est poussé à tous les visiteurs. Aucun compte n'est nécessaire.

## Stack

| Couche | Technologies |
|--------|-------------|
| Backend | Express.js, TypeORM, Socket.io, Zod, Helmet, express-rate-limit |
| Frontend | Vue 3 (Composition API), Pinia, Vue Router, vue-i18n, Axios, three.js |
| UI | Tailwind CSS v4, shadcn-vue (reka-ui), xp.css, Lucide Icons |
| Base de données | PostgreSQL (prod) / SQLite (dev) |
| Build | Vite, TypeScript, ESLint, Prettier |

## Installation

```bash
npm install
npm run dev   # http://localhost:3000
```

Sans `POSTGRES_URL`, l'app utilise un SQLite local (`sqlite.db`).

## Variables d'environnement

Copier `.env.example` vers `.env`. Il fait référence pour toutes les variables (`POSTGRES_URL`, identifiants Postgres et pgAdmin du compose).

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Développement avec hot reload |
| `npm run build` | Build de production (serveur + client) |
| `npm start` | Lance le build de production |
| `npm run lint` | ESLint + Prettier |
| `npm run dockerize` | Postgres + pgAdmin + app via Docker Compose, ports publiés en local |

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/words` | Tous les mots |
| GET | `/api/words/top` | Top 10 (`{ id, word, count, rank }`) |
| GET | `/api/words/:id` | Un mot |
| POST | `/api/words` | Crée un mot `{ word }` (67 caractères max après nettoyage des caractères invisibles et du Zalgo, doublons refusés avec `409 word_exists`, rate limité) |
| POST | `/api/words/:id/increase` | Ajoute `{ amount }` clics (250 max par batch, sinon `no_auto_click`) |

WebSocket : le serveur émet `words:top` à chaque changement (au plus une fois par seconde). Un client peut demander l'état courant en émettant `words` avec `{ action: "top" }`.

## Docker / déploiement

`docker-compose.yml` contient trois services :
- **postgres** : volume `postgres_data`
- **pgadmin** : `dpage/pgadmin4`, volume `pgadmin_data`, serveur `postgres` préenregistré via `docker/pgadmin/servers.json`
- **app** : Node, migrations appliquées au démarrage

Aucun port n'est publié dans `docker-compose.yml`. Avec Coolify/Traefik, faire pointer un domaine vers le port interne : app `3000`, pgAdmin `80`. Le proxy termine le HTTPS. En local, `docker-compose.local.yml` publie `3000` (app), `5432` (Postgres) et `5050` (pgAdmin).

Le nom d'utilisateur Postgres préenregistré dans `docker/pgadmin/servers.json` est `user`. Il faut l'adapter si `POSTGRES_USER` change.

## Migrations

En dev, le schéma se synchronise automatiquement. En prod, il passe par `server/src/migrations/`, appliquées au boot. Après une modification d'entité, avec une Postgres accessible (par exemple `npm run dockerize`) :

```bash
npm run migration:generate -- NomDeLaMigration
```

Le script crée une base temporaire, y applique les migrations existantes, génère la différence avec les entités dans `server/src/migrations/`, puis supprime la base. Il utilise `POSTGRES_URL`, sinon les identifiants par défaut de `docker-compose.local.yml`. Relire le fichier généré : un changement de colonne peut sortir en DROP + ADD, ce qui perd les données.

## RGPD

Aucune donnée personnelle n'est stockée. Voir [docs/RGPD-CHECKLIST.md](docs/RGPD-CHECKLIST.md).
