import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { zip } from "https://deno.land/std@0.210.0/collections/zip.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

interface InputHand {
  cards: Card[];
  bid: number;
}

const CARD_SCORES = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  "9": 9,
  "8": 8,
  "7": 7,
  "6": 6,
  "5": 5,
  "4": 4,
  "3": 3,
  "2": 2,
};

type Card = keyof typeof CARD_SCORES;

/**
 * @returns 0 if they're equal, -1 if `a` is stronger, 1 if `b` is stronger
 */
function compareCards(a: Card, b: Card): number {
  return Math.sign(CARD_SCORES[b] - CARD_SCORES[a]);
}

Deno.test("compareCards", () => {
  assertEquals(compareCards("A", "A"), 0);
  assertEquals(compareCards("5", "5"), 0);

  assertEquals(compareCards("A", "K"), -1);
  assertEquals(compareCards("Q", "K"), 1);

  assertEquals(compareCards("Q", "9"), -1);
  assertEquals(compareCards("7", "K"), 1);

  assertEquals(compareCards("7", "2"), -1);
  assertEquals(compareCards("3", "5"), 1);
});

const HAND_TYPE_SCORES = {
  fiveOfAKind: 7,
  fourOfAKind: 6,
  fullHouse: 5,
  threeOfAKind: 4,
  twoPair: 3,
  onePair: 2,
  highCard: 1,
};

type HandType = keyof typeof HAND_TYPE_SCORES;

function countCardsOfEachType(cards: Card[]): Partial<Record<Card, number>> {
  const counts: Partial<Record<Card, number>> = {};
  for (const card of cards) {
    counts[card] = (counts[card] ?? 0) + 1;
  }
  return counts;
}

function identifyType(cards: Card[]): HandType {
  const counts = Object.values(countCardsOfEachType(cards))
    .sort((a, b) => b - a);
  if (counts[0] === 5) {
    return "fiveOfAKind";
  }
  if (counts[0] === 4) {
    return "fourOfAKind";
  }
  if (counts[0] === 3 && counts[1] === 2) {
    return "fullHouse";
  }
  if (counts[0] === 3) {
    return "threeOfAKind";
  }
  if (counts[0] === 2 && counts[1] === 2) {
    return "twoPair";
  }
  if (counts[0] === 2) {
    return "onePair";
  }
  return "highCard";
}

Deno.test("identifyType", () => {
  assertEquals(identifyType(parseCards("AAAAA")), "fiveOfAKind");
  assertEquals(identifyType(parseCards("AA8AA")), "fourOfAKind");
  assertEquals(identifyType(parseCards("23332")), "fullHouse");
  assertEquals(identifyType(parseCards("TTT98")), "threeOfAKind");
  assertEquals(identifyType(parseCards("23432")), "twoPair");
  assertEquals(identifyType(parseCards("A23A4")), "onePair");
  assertEquals(identifyType(parseCards("23456")), "highCard");
});

/**
 * @returns 0 if they're equal, -1 if `a` is stronger, 1 if `b` is stronger
 */
function compareHands(a: Card[], b: Card[]): number {
  const aTypeScore = HAND_TYPE_SCORES[identifyType(a)];
  const bTypeScore = HAND_TYPE_SCORES[identifyType(b)];
  if (aTypeScore !== bTypeScore) {
    return Math.sign(bTypeScore - aTypeScore);
  }
  for (const [aCard, bCard] of zip(a, b)) {
    const comparison = compareCards(aCard, bCard);
    if (comparison !== 0) {
      return comparison;
    }
  }
  return 0;
}

Deno.test("compareHands", () => {
  assertEquals(compareHands(parseCards("AAAAA"), parseCards("AAAAA")), 0);
  assertEquals(compareHands(parseCards("AAAAA"), parseCards("AA8AA")), -1);
  assertEquals(compareHands(parseCards("23456"), parseCards("AA8AA")), 1);

  assertEquals(compareHands(parseCards("33332"), parseCards("2AAAA")), -1);
  assertEquals(compareHands(parseCards("77888"), parseCards("77788")), -1);
});

function parseCards(cards: string): Card[] {
  return Array.from(cards) as Card[];
}

function parse(input: string): InputHand[] {
  return input.trimEnd().split("\n").map((line) => {
    const [cards, bid] = line.split(" ");
    return { cards: parseCards(cards), bid: Number(bid) };
  });
}

function part1(input: string): number {
  const inputHands = parse(input);
  const sortedHands = inputHands.toSorted((a, b) =>
    -compareHands(a.cards, b.cards)
  );
  const handWinnings = sortedHands.map((hand, index) => (index + 1) * hand.bid);
  return handWinnings.reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const inputHands = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 7, 1, part1);
  // runPart(2023, 7, 2, part2);
}

const TEST_INPUT = `\
32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 6440);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
