import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { PgWord } from "@/types/words";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const useWordsHook = () => {
  const [wordsData, setData] = useState<PgWord[]>([]);
  const [wordData, setWordData] = useState<PgWord | null>(null);
  const [clickSinceBatch, setClickSinceBatch] = useState(0);
  const [totalAtBatch, setTotalAtBatch] = useState(0);

  const fetchData = async () => {
    const data = await apiClient.getRequest<PgWord[]>("/api/words");
    setData(data);
  };

  const fetchOne = async (id: string) => {
    const data = await apiClient.postRequest<PgWord>("/api/words", {
      id,
    });
    setClickSinceBatch(0);
    setTotalAtBatch(data.count);
    setWordData(data);
  };

  const addWord = async (word: string) => {
    await apiClient.postRequest("/api/words/add", {
      word,
    });
    fetchData();
  };

  const sendBatch = async () => {
    try {
      await apiClient.postRequest("/api/words/increase", {
        id: wordData?.id,
        amount: clickSinceBatch,
      });

      fetchOne(wordData?.id || "");
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.data.message === "no_auto_click") {
          toast.error("Eh oh hein on autoclique ??? 🤨");
        }
      }
    }
  };

  return {
    wordsData,
    wordData,
    clickSinceBatch,
    totalAtBatch,
    setClickSinceBatch,
    sendBatch,
    fetchData,
    addWord,
    fetchOne,
  };
};

export default useWordsHook;
