import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../lib/utils/apiClient";
import type { Word } from "../lib/utils/types";

export const useWordsStore = defineStore("wordsStore", () => {
  const words = ref<Word[]>([]);

  async function fetchWords() {
    const result = await apiClient.get<Word[]>("/words");
    if (result.data === null) {
      console.error("Could not fetch words:", result.error);
      return;
    }
    words.value = result.data;
  }

  // Returns the error message, null on success
  async function addWord(word: string) {
    const result = await apiClient.post<Word>("/words", { word });
    if (result.data === null) return result.error;
    words.value.push(result.data);
    return null;
  }

  return { words, fetchWords, addWord };
});
