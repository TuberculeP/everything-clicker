import { sanitizeWord, wordKey } from "../src/utils/word";

const cp = (...points: number[]) => String.fromCodePoint(...points);
const keyOf = (raw: string) => wordKey(sanitizeWord(raw));

describe("sanitizeWord", () => {
  it("trims and collapses spaces, tabs and line breaks", () => {
    expect(sanitizeWord("  hello \n\t world  ")).toBe("hello world");
  });

  it("caps combining mark piles (Zalgo)", () => {
    const zalgo = "a" + cp(0x0301).repeat(40) + "b";
    expect([...sanitizeWord(zalgo)]).toHaveLength(5);
  });

  it("removes bidi overrides and zero-width characters", () => {
    expect(sanitizeWord(`ab${cp(0x202e)}cd${cp(0x200b)}ef`)).toBe("abcdef");
  });

  it("rejects invisible-only words", () => {
    for (const raw of [
      "",
      "   ",
      cp(0x200b, 0x200b),
      cp(0x3164),
      cp(0x2800),
      cp(0x200d),
      cp(0x0301, 0x0301),
    ]) {
      expect(() => sanitizeWord(raw)).toThrow("word_empty");
    }
  });

  it("limits words to 67 code points", () => {
    expect(sanitizeWord("a".repeat(67))).toHaveLength(67);
    expect(() => sanitizeWord("a".repeat(68))).toThrow("word_too_long");
    expect([...sanitizeWord(cp(0x1f431).repeat(67))]).toHaveLength(67);
  });

  it("keeps emoji ZWJ sequences but drops stray ZWJ", () => {
    const family = cp(0x1f468, 0x200d, 0x1f469, 0x200d, 0x1f467);
    expect(sanitizeWord(family)).toBe(family);
    expect(sanitizeWord(`a${cp(0x200d)}b`)).toBe("ab");
  });

  it("folds styled Unicode letters", () => {
    // Mathematical bold "chat"
    expect(sanitizeWord(cp(0x1d41c, 0x1d421, 0x1d41a, 0x1d42d))).toBe("chat");
  });
});

describe("wordKey", () => {
  it("matches case, accent, spacing, punctuation and lookalike variants", () => {
    const key = keyOf("Chat");
    for (const variant of [
      "chat",
      "CHÂT",
      "c h a t",
      "chat !",
      cp(0x1d41c, 0x1d421, 0x1d41a, 0x1d42d),
      // Cyrillic "с" and "а"
      `${cp(0x0441)}h${cp(0x0430)}t`,
      // Cyrillic uppercase "СНАТ"
      cp(0x0421, 0x041d, 0x0410, 0x0422),
    ]) {
      expect(keyOf(variant)).toBe(key);
    }
  });

  it("keeps different words apart", () => {
    expect(keyOf("chat")).not.toBe(keyOf("chien"));
    expect(keyOf("chat")).not.toBe(keyOf(`chat ${cp(0x1f431)}`));
  });

  it("gives punctuation-only words a non empty key", () => {
    expect(keyOf("???")).toBe("???");
    expect(keyOf("???")).not.toBe(keyOf("!!!"));
  });
});
