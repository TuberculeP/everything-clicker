import { AppError } from "./AppError";

export const MAX_WORD_LENGTH = 67;

// Spaces, line breaks and control characters all become a plain space
const SPACES = /[\s\p{Cc}\p{Zs}\p{Zl}\p{Zp}]+/gu;
// Format (bidi overrides, zero-width...), private use, unassigned and lone
// surrogates, except the ZWJ that composed emojis need. Plus the fillers that
// render as nothing but are classified as letters or symbols.
const INVISIBLES =
  /(?!\u200D)[\p{Cf}\p{Co}\p{Cn}\p{Cs}]|[\u034F\u115F\u1160\u180E\u2800\u3164\uFFA0]/gu;
// A ZWJ only means something between two emojis
const STRAY_ZWJ =
  /(?<![\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F])\u200D|\u200D(?!\p{Extended_Pictographic})/gu;
// Zalgo: keep at most 3 combining marks in a row
const MARK_PILES = /(\p{M}{3})\p{M}+/gu;
const VISIBLE = /[\p{L}\p{N}\p{P}\p{S}]/u;

// Cyrillic and Greek letters that look like Latin ones (after lowercasing)
const LOOKALIKES: Record<string, string> = {
  "\u0430": "a", // а
  "\u0432": "b", // в (В)
  "\u0435": "e", // е
  "\u04BB": "h", // һ
  "\u043D": "h", // н (Н)
  "\u0456": "i", // і
  "\u0458": "j", // ј
  "\u043A": "k", // к
  "\u043C": "m", // м (М)
  "\u043E": "o", // о
  "\u0440": "p", // р
  "\u051B": "q", // ԛ
  "\u0455": "s", // ѕ
  "\u0442": "t", // т (Т)
  "\u0441": "c", // с
  "\u0501": "d", // ԁ
  "\u051D": "w", // ԝ
  "\u0445": "x", // х
  "\u0443": "y", // у
  "\u03B1": "a", // α
  "\u03B2": "b", // β
  "\u03B5": "e", // ε
  "\u03B9": "i", // ι
  "\u03BA": "k", // κ
  "\u03BC": "m", // μ (Μ)
  "\u03BD": "v", // ν
  "\u03BF": "o", // ο
  "\u03C1": "p", // ρ
  "\u03C4": "t", // τ
  "\u03C5": "u", // υ
  "\u03C7": "x", // χ
  "\u03B6": "z", // ζ (Ζ)
};
const LOOKALIKE_REGEX = new RegExp(
  `[${Object.keys(LOOKALIKES).join("")}]`,
  "gu",
);

/** Cleans a user submitted word, throws AppError("word_empty" | "word_too_long", 400). */
export function sanitizeWord(raw: string): string {
  const word = raw
    .normalize("NFKC")
    .replace(SPACES, " ")
    .replace(INVISIBLES, "")
    .replace(STRAY_ZWJ, "")
    .replace(MARK_PILES, "$1")
    .replace(/ {2,}/g, " ")
    .trim();
  if (!VISIBLE.test(word)) {
    throw new AppError("word_empty", 400);
  }
  // Code points, like Postgres varchar(n)
  if ([...word].length > MAX_WORD_LENGTH) {
    throw new AppError("word_too_long", 400);
  }
  return word;
}

/** Duplicate detection key of a word already passed through sanitizeWord. */
export function wordKey(word: string): string {
  const lower = word.toLowerCase();
  const key = lower
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(LOOKALIKE_REGEX, (c) => LOOKALIKES[c])
    .replace(/[\s\p{P}\u200D]/gu, "");
  // Punctuation only words ("???") would all share an empty key
  return key || lower.replace(/\s/g, "");
}
