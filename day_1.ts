import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.0/mod.ts";

function parse(input: string) {
  return input.trimEnd().split("\n");
}

function part1(input: string): number {
  const items = parse(input);
  return items.map((line) => {
    const onlyNumbers = line.replace(/[^0-9]+/g, "");
    const firstDigit = onlyNumbers[0];
    const lastDigit = onlyNumbers[onlyNumbers.length - 1];
    return Number(firstDigit + lastDigit);
  }).reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 1, 1, part1);
  // runPart(2023, 1, 2, part2);
}

const TEST_INPUT = `\
1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 142);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
