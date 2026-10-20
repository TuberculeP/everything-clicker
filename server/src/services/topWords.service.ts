import throttle from "lodash/throttle";
import type { Server } from "socket.io";
import pg from "../config/db.config";
import { Word } from "../config/entities/Word";

export type TopWord = Pick<Word, "id" | "word" | "count"> & { rank: number };

const TOP_SIZE = 10;
const BROADCAST_INTERVAL_MS = 1000;

let io: Server | null = null;

export function setIo(server: Server) {
  io = server;
}

export async function getTopWords(): Promise<TopWord[]> {
  const words = await pg.getRepository(Word).find({
    select: ["id", "word", "count"],
    order: { count: "DESC", createdAt: "ASC" },
    take: TOP_SIZE,
  });
  return words.map(({ id, word, count }, i) => ({
    id,
    word,
    count,
    rank: i + 1,
  }));
}

// Every click batch triggers this: throttled so a busy server emits at most
// once per interval, trailing call included so the last state always goes out.
export const broadcastTopWords = throttle(
  async () => {
    if (!io) return;
    try {
      io.emit("words:top", await getTopWords());
    } catch (err) {
      console.error("broadcastTopWords failed", err);
    }
  },
  BROADCAST_INTERVAL_MS,
  { leading: true, trailing: true },
);
