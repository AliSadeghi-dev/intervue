import { findWordIndexAtChar, tokenizeQuestion } from "@/lib/speech/question-text";

describe("question text tokenization", () => {
  it("splits words and preserves spaces with stable indices", () => {
    const tokens = tokenizeQuestion("Hello, React world.");
    const words = tokens.filter((t) => t.isWord).map((t) => t.text);
    expect(words).toEqual(["Hello,", "React", "world."]);
    expect(tokens.find((t) => t.text === "React")?.start).toBe(7);
  });

  it("maps charIndex to word index for highlight sync", () => {
    const text = "What is useState?";
    const tokens = tokenizeQuestion(text);
    expect(findWordIndexAtChar(tokens, 0)).toBe(0);
    expect(findWordIndexAtChar(tokens, 5)).toBe(1);
    expect(findWordIndexAtChar(tokens, 8)).toBe(2);
  });
});