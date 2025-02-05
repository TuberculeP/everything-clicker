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
  }, [clickSinceBatch, timeOutDone]);

  useEffect(() => {
    if (!timeOutDone && clickSinceBatch > 0 && !batching) {
      setBatching(true);
      setTimeout(() => {
        doneTimeOut(true);
        setBatching(false);
      }, 2000);
    }
  }, [timeOutDone, clickSinceBatch, batching]);

  return !wordData ? (
    <div>Loading...</div>
  ) : (
    <div>
      <h1>
        {wordData.word} ({wordData.count + clickSinceBatch})
      </h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full aspect-square"
        onClick={() => setClickSinceBatch(clickSinceBatch + 1)}
      >
        Increase
      </button>
      <p>Total at batch : {totalAtBatch}</p>
      <p>Click since batch : {clickSinceBatch}</p>
    </div>
  );
};

export default Page;
