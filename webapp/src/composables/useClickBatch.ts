import { onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import apiClient from "../lib/utils/apiClient";
import type { Word } from "../lib/utils/types";
import { toast } from "@/components/ui/sonner";

const BATCH_INTERVAL_MS = 2000;

// Clicks are counted locally and sent every BATCH_INTERVAL_MS, the server
// rejects batches above its anti auto-click limit with "no_auto_click".
export function useClickBatch(id: Ref<string>) {
  const { t } = useI18n();

  const word = ref<Word | null>(null);
  const notFound = ref(false);
  const pending = ref(0);
  const totalAtBatch = ref(0);
  let sending = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  const setWord = (data: Word) => {
    word.value = data;
    totalAtBatch.value = data.count;
  };

  async function load() {
    word.value = null;
    notFound.value = false;
    pending.value = 0;
    const { data } = await apiClient.get<Word>(`/words/${id.value}`);
    if (data) setWord(data);
    else notFound.value = true;
  }

  async function flush() {
    if (sending || pending.value === 0 || !word.value) return;
    sending = true;
    // Clicks made while the request is in flight stay in `pending`
    const amount = pending.value;
    pending.value -= amount;
    const { data, error } = await apiClient.post<Word>(
      `/words/${word.value.id}/increase`,
      { amount },
    );
    sending = false;
    if (data) {
      setWord(data);
    } else if (error === "no_auto_click") {
      toast.error(t("word.autoClick"));
    } else {
      console.error("Could not send clicks:", error);
    }
  }

  function click() {
    pending.value++;
  }

  watch(id, async () => {
    await flush();
    await load();
  });

  onMounted(() => {
    load();
    timer = setInterval(flush, BATCH_INTERVAL_MS);
  });

  onBeforeUnmount(() => {
    clearInterval(timer);
    flush();
  });

  return { word, notFound, pending, totalAtBatch, click };
}
