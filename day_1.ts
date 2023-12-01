import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

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

const digits = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

function part2(input: string): number {
  const items = parse(input);
  return items.map((line) => {
    const digitsInLine: number[] = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i] >= "0" && line[i] <= "9") {
        digitsInLine.push(Number(line[i]));
      } else {
        for (
          let digitIndex = 0;
          digitIndex < digits.length;
          digitIndex++
        ) {
          if (line.startsWith(digits[digitIndex], i)) {
            digitsInLine.push(digitIndex);
            break;
          }
        }
      }
    }
    const firstDigit = digitsInLine[0];
    const lastDigit = digitsInLine[digitsInLine.length - 1];
    return firstDigit * 10 + lastDigit;
  }).reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2023, 1, 1, part1);
  runPart(2023, 1, 2, part2);
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

const TEST_INPUT2 = `\
two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen
`;

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT2), 281);
});
