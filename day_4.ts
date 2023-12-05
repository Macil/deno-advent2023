import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

interface Card {
  winningNumbers: number[];
  cardNumbers: number[];
}

function countWinningNumbers(card: Card): number {
  const { winningNumbers, cardNumbers } = card;
  let count = 0;
  for (const cardNumber of cardNumbers) {
    if (winningNumbers.includes(cardNumber)) {
      count++;
    }
  }
  return count;
}

function scoreCard(card: Card): number {
  const count = countWinningNumbers(card);
  return count === 0 ? 0 : 2 ** (count - 1);
}

function parse(input: string): Card[] {
  return input.trimEnd().split("\n").map((line) => {
    const [_header, winningNumbers, cardNumbers] = line.split(/[:|]/);
    return {
      winningNumbers: winningNumbers.trim().split(/ +/).map(Number),
      cardNumbers: cardNumbers.trim().split(/ +/).map(Number),
    };
  });
}

function part1(input: string): number {
  const cards = parse(input);
  return cards.map(scoreCard).reduce((a, b) => a + b, 0);
}

function part2(input: string): number {
  const cards = parse(input);
  const countPerCard = cards.map(() => 1);
  cards.forEach((card, i) => {
    const countOfThisCard = countPerCard[i];
    const winningCount = countWinningNumbers(card);
    for (let j = i + 1; j < Math.min(i + winningCount + 1, cards.length); j++) {
      countPerCard[j] += countOfThisCard;
    }
  });
  return countPerCard.reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2023, 4, 1, part1);
  runPart(2023, 4, 2, part2);
}

const TEST_INPUT = `\
Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 13);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 30);
});
