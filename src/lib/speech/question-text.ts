export type QuestionToken = {
  text: string;
  start: number;
  isWord: boolean;
  wordIndex: number;
};

export function tokenizeQuestion(text: string): QuestionToken[] {
  const tokens: QuestionToken[] = [];
  const pattern = /\S+|\s+/g;
  let match: RegExpExecArray | null;
  let wordIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    const chunk = match[0];
    const isWord = /\S/.test(chunk);
    tokens.push({
      text: chunk,
      start: match.index,
      isWord,
      wordIndex: isWord ? wordIndex++ : -1,
    });
  }

  return tokens;
}

export function findWordIndexAtChar(tokens: QuestionToken[], charIndex: number): number {
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (!token.isWord) {
      continue;
    }
    if (charIndex >= token.start) {
      return token.wordIndex;
    }
  }
  return 0;
}