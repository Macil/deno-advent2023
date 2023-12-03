import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

interface Coordinate {
  row: number;
  column: number;
}

function parse(input: string): string[] {
  return input.trimEnd().split("\n");
}

function numberHasSymbolNeighbors(
  lines: string[],
  numberCoordinate: Coordinate,
  numberLength: number,
): boolean {
  for (
    let row = numberCoordinate.row - 1;
    row <= numberCoordinate.row + 1;
    row++
  ) {
    const line = lines[row];
    if (!line) {
      continue;
    }
    const searchPart = line.slice(
      Math.max(0, numberCoordinate.column - 1),
      numberCoordinate.column + numberLength + 1,
    );
    if (/[^0-9.]/.test(searchPart)) {
      return true;
    }
  }
  return false;
}

function part1(input: string): number {
  const lines = parse(input);
  const partNumbers: number[] = [];
  lines.forEach((line, row) => {
    for (const numberMatch of line.matchAll(/[0-9]+/g)) {
      const numberCoordinate: Coordinate = {
        row,
        column: numberMatch.index!,
      };
      if (
        numberHasSymbolNeighbors(lines, numberCoordinate, numberMatch[0].length)
      ) {
        partNumbers.push(Number(numberMatch[0]));
      }
    }
  });
  return partNumbers.reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const lines = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 3, 1, part1);
  // runPart(2023, 3, 2, part2);
}

const TEST_INPUT = `\
467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 4361);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
