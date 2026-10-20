export type Word = {
  id: string;
  word: string;
  count: number;
  createdAt: string;
  updatedAt: string;
};

export type TopWord = Pick<Word, "id" | "word" | "count"> & { rank: number };
