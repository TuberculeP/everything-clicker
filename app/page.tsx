"use client";

import useWordsHook from "@/hooks/wordsHook";
import { useEffect } from "react";

export default function Home() {
  const { wordsData, fetchData, addWord } = useWordsHook();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Trouve un mot à cliquer</h1>
      <div className="flex flex-wrap gap-4">
        {wordsData.map((word) => (
          <a
            className="
            bg-blue-500
            hover:bg-blue-700
            text-white
            font-bold
            py-2
            px-4
            rounded
            cursor-pointer
          "
            key={word.id}
            href={`/w/${word.id}`}
          >
            {word.word}
          </a>
        ))}
      </div>
      <input
        type="text"
        placeholder="Add word"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            addWord(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}
