FROM node:23-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Ensures a .env exists so the app can start even if none was provided
# at build time (docker-compose still injects real values via `environment:`).
RUN touch .env

RUN npm run build

# Étape finale, beaucoup plus légère
FROM node:23-slim

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["npm", "start"]