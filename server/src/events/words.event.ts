import type { EventGroup } from "./event_handler";
import { getTopWords } from "../services/topWords.service";

const wordsEvents: EventGroup = {
  // Client emits "words" with { action: "top" } on connect to get the
  // current top 10, later updates come from broadcastTopWords()
  default: async ({ data, ws }) => {
    if (data?.action !== "top" || !ws) return;
    try {
      ws.emit("words:top", await getTopWords());
    } catch (err) {
      console.error("words:top failed", err);
    }
  },
};

export default wordsEvents;
