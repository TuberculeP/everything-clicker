"use client";

import Link from "next/link";
import "./globals.css";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";
import AudioPlayer from "@/components/audioPlayer";

const carmen = localFont({ src: "../fonts/Carmen.ttf" });
const comic = localFont({ src: "../fonts/Comic Sans MS.ttf" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [topWords, setTopWords] = useState<
    { id: string; word: string; count: string; rank: number }[]
  >([]);

  useEffect(() => {
    let eventSource = new EventSource(`${window.location.origin}/events`);

    const onMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setTopWords(data);
    };

    const onError = () => {
      eventSource.close();
      setTimeout(() => {
        eventSource = new EventSource(`${window.location.origin}/events`);
        eventSource.onmessage = onMessage;
        eventSource.onerror = onError;
      }, 3000);
    };

    eventSource.onmessage = onMessage;
    eventSource.onerror = onError;

    return () => {
      eventSource.close();
    };
  }, []);

  const [sombre, setSombre] = useState(false);

  return (
    <html lang="fr" className={comic.className}>
      <body className="antialiased h-[100vh] grid grid-rows-[auto,1fr] bg-black">
        <header className="bg-black text-white p-4 col-span-full grid items-center grid-cols-[1fr_2fr_1fr]">
          <div>
            <AudioPlayer />
          </div>
          <div className="flex justify-center">
            <Link href="/" className=" flex items-center gap-8">
              <img
                src="https://web.archive.org/web/20091019201518/http://www.geocities.com/powitree/fingerClickanigif.gif"
                alt=""
                className="block"
                width={50}
              />
              <h1 className={"text-4xl cursor-pointer " + carmen.className}>
                Everything Clicker
              </h1>
              <img
                src="https://web.archive.org/web/20091019201518/http://www.geocities.com/powitree/fingerClickanigif.gif"
                alt=""
                className="block"
                width={50}
              />
            </Link>
          </div>
          <div className="flex justify-end">
            <button
              className="text-xs flex items-center gap-2 cursor-pointer"
              onClick={() => setSombre(!sombre)}
            >
              Mode {sombre ? "clair" : "sombre"}
              <img
                src="https://web.archive.org/web/20091026063902/http://geocities.com/rumbleinthejungle_2000_2000/sun.gif"
                alt=""
              />
            </button>
          </div>
        </header>
        {!sombre ? (
          <div className={"grid grid-cols-[1fr_auto] bg-white"}>
            <main className="">
              <Toaster position="bottom-left" />
              {children}
            </main>
            <aside className="w-fit bg-gray-100">
              <h2 className="text-xl font-semibold mb-2">Top 10 Words</h2>
              <ul className="space-y-2">
                {topWords.map(({ word, count, rank }) => (
                  <li
                    key={word}
                    className="grid grid-cols-[auto_1fr_auto] gap-2"
                  >
                    <span>{rank}</span>
                    <span className="max-w-48">{word}</span>
                    <span>({count})</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src="https://web.archive.org/web/20090820020041/http://geocities.com/mikeskellenger/eyessmall1.gif"
              alt=""
            />
          </div>
        )}
      </body>
    </html>
  );
}
