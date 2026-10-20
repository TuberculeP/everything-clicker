import "reflect-metadata";
import "dotenv/config";
import pg from "./config/db.config";
import path from "path";
import express from "express";
import helmet from "helmet";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { Server as WSServer } from "socket.io";
import { registerWebsocketListeners } from "./events/event_handler";
import router from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { setIo } from "./services/topWords.service";

const main = async () => {
  const dev = process.env.NODE_ENV !== "production";

  const app = express();
  const server = createHttpServer(app);

  // Behind Traefik/Coolify: trust the first proxy so express-rate-limit sees
  // the client IP instead of the proxy's for everyone.
  app.set("trust proxy", 1);

  app.use(helmet()).use(express.json());

  app.use("/api", router);
  app.use("/api", errorHandler);

  const vite = await createViteServer();

  app.use("/public", express.static("public"));

  if (dev) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "./client")));
  }

  app.use(async (req, res, next) => {
    if (dev) {
      vite.middlewares(req, res, next);
    } else {
      res.sendFile(path.resolve(__dirname, "./client/index.html"));
    }
  });

  // WebSocket server
  const wss = new WSServer(server);
  registerWebsocketListeners(wss);
  setIo(wss);

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
};

// start typeorm migration and server
(async () => {
  await pg.initialize();
  // Migrations only run against Postgres in production: dev and the
  // SQLite fallback rely on `synchronize: true` instead, and running
  // both against the same schema conflicts.
  if (process.env.NODE_ENV === "production" && process.env.POSTGRES_URL) {
    await pg.runMigrations();
  }
  await main();
})();
