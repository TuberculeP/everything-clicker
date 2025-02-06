"use client";

import Link from "next/link";
import "./globals.css";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [topWords, setTopWords] = useState<
    { word: string; count: string; rank: number }[]
  >([]);

  useEffect(() => {
    const eventSource = new EventSource(`${window.location.origin}/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTopWords(data);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <html lang="fr">
      <body className="antialiased h-[100vh] grid grid-rows-[auto,1fr] grid-cols-[1fr_auto]">
        <header className="bg-blue-600 text-white p-4 col-span-full">
          <Link href="/">
            <h1 className="text-2xl font-bold">Everything Clicker</h1>
          </Link>
        </header>
        <main className="">
          <Toaster position="bottom-left" />
          {children}
        </main>
        <aside className="w-fit bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">Top 10 Words</h2>
          <ul className="space-y-2">
            {topWords.map(({ word, count, rank }) => (
              <li key={word} className="grid grid-cols-[auto_1fr_auto] gap-2">
                <span>{rank}</span>
                <span className="max-w-48">{word}</span>
                <span>({count})</span>
              </li>
            ))}
          </ul>
        </aside>
      </body>
    </html>
  );
}
