import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { onSocketConnected, onSocketEvent } from "../lib/utils/websocket";
import type { TopWord } from "../lib/utils/types";

export const useTopWordsStore = defineStore("topWordsStore", () => {
  const top = ref<TopWord[]>([]);

  // Count mapped to [0, 1] for the 3D scene (sphere radius)
  const normalized = computed(() => {
    const counts = top.value.map((w) => w.count);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const range = max - min;
    return top.value.map((w) => ({
      ...w,
      value: range === 0 ? 1 : (w.count - min) / range,
    }));
  });

  // The server pushes "words:top" after every change (throttled), we only
  // ask for the current state on each (re)connection.
  onSocketEvent("words:top", (data: TopWord[]) => {
    top.value = data;
  });
  onSocketConnected((socket) => {
    socket.emit("words", { action: "top" });
    socket.on("connect", () => socket.emit("words", { action: "top" }));
  });

  return { top, normalized };
});
