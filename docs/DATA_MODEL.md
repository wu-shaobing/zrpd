# 数据模型与类型（Data Model）

## TypeScript 类型（建议）

```ts
export type Example = { word: string; ipa?: string };
export type Sound = { ipa: string; examples: Example[] };
export type VowelRule = { letter: 'A'|'E'|'I'|'O'|'U'; sounds: Sound[] };
export type ConsonantRule = { letter: string; sounds: string[] };
export type DigraphRule = { pattern: string; sounds: Sound[] };

export type GameCard = {
  id: string;
  front: { text: string; color?: string };
  back: { ipa: string; examples: string[] };
  points: number;
  scored?: boolean;
};

export type ScoreState = { score: number; addScore: (n: number) => void };
export type ProgressState = { percent: number; setPercent: (p: number) => void };
```

## 数据来源

- 从 HTML 归纳的发音规则与示例
- 后续可引入更丰富的词表与音素库
