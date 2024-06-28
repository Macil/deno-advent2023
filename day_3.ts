import { assertEquals } from "@std/assert";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

class Coordinate {
  row: number;
  column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  toString() {
    return `${this.row},${this.column}`;
  }

  static fromString(str: string): Coordinate {
    const [row, column] = str.split(",").map(Number);
    return new Coordinate(row, column);
  }
}

function parse(input: string): string[] {
  return input.trimEnd().split("\n");
}

function* getNumberSymbolNeighbors(
  lines: string[],
  numberCoordinate: Coordinate,
  numberLength: number,
  symbolRegex = /[^0-9.]/g,
): Generator<Coordinate> {
  for (
    let row = numberCoordinate.row - 1;
    row <= numberCoordinate.row + 1;
    row++
  ) {
    const line = lines[row];
    if (!line) {
      continue;
    }
    const searchPartStart = Math.max(0, numberCoordinate.column - 1);
    const searchPart = line.slice(
      searchPartStart,
      numberCoordinate.column + numberLength + 1,
    );
    for (const symbolMatch of searchPart.matchAll(symbolRegex)) {
      yield new Coordinate(row, searchPartStart + symbolMatch.index!);
    }
  }
}

function numberHasSymbolNeighbors(
  lines: string[],
  numberCoordinate: Coordinate,
  numberLength: number,
  symbolRegex?: RegExp,
): boolean {
  for (
    const _value of getNumberSymbolNeighbors(
      lines,
      numberCoordinate,
      numberLength,
      symbolRegex,
    )
  ) {
    // Just return true as soon as we've found one, don't need to keep looking.
    return true;
  }
  return false;
}

function part1(input: string): number {
  const lines = parse(input);
  const partNumbers: number[] = [];
  lines.forEach((line, row) => {
    for (const numberMatch of line.matchAll(/[0-9]+/g)) {
      const numberCoordinate = new Coordinate(row, numberMatch.index!);
      if (
        numberHasSymbolNeighbors(lines, numberCoordinate, numberMatch[0].length)
      ) {
        partNumbers.push(Number(numberMatch[0]));
      }
    }
  });
  return partNumbers.reduce((a, b) => a + b, 0);
}

function part2(input: string): number {
  const lines = parse(input);
  // keys are stringified coordinates
  const gearCoordsToNumbers = new Map<string, number[]>();
  lines.forEach((line, row) => {
    for (const numberMatch of line.matchAll(/[0-9]+/g)) {
      const numberCoordinate = new Coordinate(row, numberMatch.index!);
      for (
        const gearCoordinate of getNumberSymbolNeighbors(
          lines,
          numberCoordinate,
          numberMatch[0].length,
          /\*/g,
        )
      ) {
        const gearCoordinateString = gearCoordinate.toString();
        let gearNumbers = gearCoordsToNumbers.get(gearCoordinateString);
        if (!gearNumbers) {
          gearNumbers = [];
          gearCoordsToNumbers.set(gearCoordinateString, gearNumbers);
        }
        gearNumbers.push(Number(numberMatch[0]));
      }
    }
  });
  return Array.from(gearCoordsToNumbers.values())
    .filter((gearNumbers) => gearNumbers.length === 2)
    .map(([a, b]) => a * b)
    .reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2023, 3, 1, part1);
  runPart(2023, 3, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 467835);
});
