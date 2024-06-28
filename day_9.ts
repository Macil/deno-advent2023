import { assertEquals } from "@std/assert";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

function parse(input: string): Array<Array<number>> {
  return input.trimEnd().split("\n").map((line) =>
    line.split(/\s+/).map(Number)
  );
}

function predictNext(sequence: Array<number>): number {
  const allZero = sequence.every((n) => n === 0);
  if (allZero) {
    return 0;
  }
  const differences = sequence.slice(1).map((n, i) => n - sequence[i]);
  const nextDifference = predictNext(differences);
  return sequence[sequence.length - 1] + nextDifference;
}

function part1(input: string): number {
  const histories = parse(input);
  return histories.map(predictNext).reduce((a, b) => a + b, 0);
}

function predictPrevious(sequence: Array<number>): number {
  const allZero = sequence.every((n) => n === 0);
  if (allZero) {
    return 0;
  }
  const differences = sequence.slice(1).map((n, i) => n - sequence[i]);
  const prevDifference = predictPrevious(differences);
  return sequence[0] - prevDifference;
}

function part2(input: string): number {
  const histories = parse(input);
  return histories.map(predictPrevious).reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2023, 9, 1, part1);
  runPart(2023, 9, 2, part2);
}

const TEST_INPUT = `\
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 114);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 2);
});
