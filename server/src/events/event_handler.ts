import type { Server, Socket } from "socket.io";
import wordsEvents from "./words.event";

export type SubEventFunction = (params: {
  event: string;
  ws?: Socket;
  data?: any;
}) => void;

export type EventGroup = Record<string, SubEventFunction>;

const eventGroupList: Record<string, EventGroup> = {
  // Register your event groups here
  words: wordsEvents,
};

export function registerWebsocketListeners(wss: Server) {
  wss.on("connection", (ws) => {
    for (const [prefix, events] of Object.entries(eventGroupList)) {
      for (const [event, handler] of Object.entries(events)) {
        if (event === "default") {
          ws.on(prefix, (data) => {
            handler({ event, data, ws });
          });
          continue;
        }
        ws.on(`${prefix}:${event}`, (data) => {
          handler({ event, data, ws });
        });
      }
    }
  });
}
