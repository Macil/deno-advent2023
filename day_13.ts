import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

interface Pattern {
  lines: string[];
}

function parse(input: string): Pattern[] {
  return input.trimEnd().split("\n\n")
    .map((chunk) => ({ lines: chunk.split("\n") }));
}

function checkVerticalReflection(pattern: Pattern, index: number): boolean {
  const comparisonLength = Math.min(index, pattern.lines[0].length - index);
  return pattern.lines.every((line) => {
    for (let x = index - comparisonLength; x < index; x++) {
      if (line[x] !== line[index + index - x - 1]) {
        return false;
      }
    }
    return true;
  });
}

function findVerticalReflection(pattern: Pattern): number | undefined {
  for (let i = 1; i < pattern.lines[0].length; i++) {
    if (checkVerticalReflection(pattern, i)) {
      return i;
    }
  }
  return undefined;
}

function checkHorizontalReflection(pattern: Pattern, index: number): boolean {
  const comparisonLength = Math.min(index, pattern.lines.length - index);
  for (let x = 0; x < pattern.lines[0].length; x++) {
    for (let y = index - comparisonLength; y < index; y++) {
      if (pattern.lines[y][x] !== pattern.lines[index + index - y - 1][x]) {
        return false;
      }
    }
  }
  return true;
}

function findHorizontalReflection(pattern: Pattern): number | undefined {
  for (let i = 1; i < pattern.lines.length; i++) {
    if (checkHorizontalReflection(pattern, i)) {
      return i;
    }
  }
  return undefined;
}

function summarizePattern(pattern: Pattern): number {
  const verticalReflectionIndex = findVerticalReflection(pattern);
  if (verticalReflectionIndex !== undefined) {
    return verticalReflectionIndex;
  }
  const horizontalReflectionIndex = findHorizontalReflection(pattern);
  if (horizontalReflectionIndex !== undefined) {
    return horizontalReflectionIndex * 100;
  }
  throw new Error("No reflection found");
}

function part1(input: string): number {
  const patterns = parse(input);
  return patterns.map(summarizePattern).reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const patterns = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 13, 1, part1);
  // runPart(2023, 13, 2, part2);
}

const TEST_INPUT = `\
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 405);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
