# Checklist RGPD

Ce document n'est **pas un audit juridique**. C'est l'état technique du projet vis-à-vis des données personnelles.

## 1. Données traitées

- [x] Aucun compte, aucune session, aucun cookie applicatif : la base ne contient que des mots et des compteurs (`server/src/config/entities/Word.ts`).
- [x] Les mots sont du contenu public, saisi librement et non rattaché à une personne.
- [x] L'adresse IP n'est utilisée que par le rate limiting (`server/src/middleware/rateLimiter.middleware.ts`), en mémoire et pour une fenêtre de 1 à 15 minutes. Elle n'est ni persistée ni loggée par l'application.
- [x] Les erreurs loggées (`error.middleware.ts`) ne contiennent pas `req.body`.

## 2. Points de vigilance

- [ ] **Contenu saisi par les visiteurs** : rien n'empêche quelqu'un de saisir un nom ou une donnée personnelle comme "mot". Il faut prévoir la suppression sur demande, aujourd'hui faisable via pgAdmin.
- [ ] **Logs du reverse proxy (Traefik/Coolify)** : ils contiennent les IP. Leur durée de conservation se règle côté infra.
- [ ] **Accès pgAdmin** : il donne un accès complet à la base. Il faut un mot de passe fort (`PGADMIN_DEFAULT_PASSWORD`) et, idéalement, une restriction d'accès au niveau de Traefik (IP allowlist ou basic auth).
- [ ] **Sauvegardes** : `pg_dump` régulier du volume `postgres_data`, avec un test de restauration.
- [ ] **Mentions légales** : aucune page dédiée pour l'instant.
- [ ] **Ressources tierces** : les GIFs et polices sont servis localement. Le lien du footer pointe vers Google, mais seulement au clic.
