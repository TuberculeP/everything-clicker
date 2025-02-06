import dotenv from "dotenv";
import path from "path";
import express from "express";
import next from "next";
import { pg, pgClient, pgConnect } from "./config/db.config";
import router from "./routes";

// Load environment variables
const dev = process.env.NODE_ENV !== "production";
dotenv.config({
  path: [
    path.resolve(__dirname, `${dev ? "../" : ""}../.env.local`),
    path.resolve(__dirname, `${dev ? "../" : ""}../.env`),
  ],
});

// Init all configs
pgConnect();

// Next.js initialization
const app = next({ dev });
const handle = app.getRequestHandler();

// Express.js initialization
const server = express();
server.use(express.json());

// Express.js routing
server.use("/public", express.static(path.join(__dirname, "public")));
server.use("/api", router);

// SSE route
server.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  const getTopWords = async () => {
    const result = await pg.query(
      "SELECT id, word, count FROM top_words ORDER BY count DESC"
    );
    return result.rows.map((row, i) => ({
      ...row,
      rank: i + 1,
    }));
  };

  const sendTopWords = async () => {
    const words = await getTopWords();
    sendEvent(JSON.stringify(words));
  };

  // Écouter les notifications PostgreSQL
  pgClient.query("LISTEN top_words_update");
  pgClient.on("notification", () => {
    sendTopWords();
  });

  req.on("close", () => {
    pgClient.query("UNLISTEN top_words_update");
    res.end();
  });

  // Envoyer les mots initiaux
  sendTopWords();
});

// Start the server
app.prepare().then(() => {
  // Express.js routes and middleware go here
  server.use("/api", (req, res, next) => {
    console.log(`API call: ${req.method} ${req.url}`);
    next();
  });

  // nextjs
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
