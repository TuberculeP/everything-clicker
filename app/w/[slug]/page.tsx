"use client";

import useWordsHook from "@/hooks/wordsHook";
import { useEffect, useState } from "react";

const Page = ({ params: { slug } }: { params: { slug: string } }) => {
  const {
    wordData,
    fetchOne,
    clickSinceBatch,
    totalAtBatch,
    setClickSinceBatch,
    sendBatch,
  } = useWordsHook();

  useEffect(() => {
    fetchOne(slug);
  }, [slug]);

  const [timeOutDone, doneTimeOut] = useState(false);
  const [batching, setBatching] = useState(false);

  useEffect(() => {
    if (timeOutDone && !batching) {
      sendBatch();
      doneTimeOut(false);
    }
  }, [wordData, timeOutDone]);

  useEffect(() => {
    if (!timeOutDone && !batching) {
      setBatching(true);
      setTimeout(() => {
        doneTimeOut(true);
        setBatching(false);
      }, 2000);
    }
  }, [timeOutDone, batching]);

  return !wordData ? (
    <div>
      <img src="" alt="chargementet" />
    </div>
  ) : (
    <div className="flex flex-1 flex-col items-center justify-center">
      <h1 className="text-2xl">
        {wordData.word} ({wordData.count + clickSinceBatch})
      </h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full aspect-square text-4xl transition-transform transform active:scale-90"
        onClick={() => setClickSinceBatch(clickSinceBatch + 1)}
      >
        Increase
      </button>
      <p className="mt-4">Total at batch : {totalAtBatch}</p>
      <p>Click since batch : {clickSinceBatch}</p>
    </div>
  );
};

export default Page;
