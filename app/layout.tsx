"use client";

import "./globals.css";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [topWords, setTopWords] = useState<
    { word: string; count: string; rank: number }[]
  >([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3000/events");

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
      <body className="antialiased">
        <div className="top-words">
          <h2>Top 10 Words</h2>
          {topWords.map(({ word, count }) => (
            <>
              <span>
                {word} ({count})
              </span>
              <br />
            </>
          ))}
        </div>
        {children}
      </body>
    </html>
  );
}
