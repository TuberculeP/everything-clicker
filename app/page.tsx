"use client";

import useWordsHook from "@/hooks/wordsHook";
import { useEffect } from "react";

export default function Home() {
  const { wordsData, fetchData, addWord } = useWordsHook();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trouve un mot à cliquer</h1>
      <p className="mb-2">
        Vous ne trouvez pas votre bonheur ? Créez votre mot à cliquer !
      </p>
      <input
        type="text"
        placeholder="Add word"
        className="border border-gray-300 rounded py-2 px-4 w-full"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            addWord(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />
      <div className="mb-4"></div>
      <div className="flex flex-wrap gap-4 mb-4">
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
    </div>
  );
}
