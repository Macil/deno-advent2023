import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { Coordinate, manhattanDistance } from "./lib/Coordinate.ts";

function linesToGalaxyCoordinates(lines: string[]): Coordinate[] {
  return lines.flatMap((line, y) =>
    Array.from(line).flatMap((cell, x) =>
      cell === "#" ? [new Coordinate(x, y)] : []
    )
  );
}

/**
 * Takes a sorted list of indexes, and returns the number of missing indexes
 * less than `limit`.
 */
function countMissingIndexes(indexes: number[], limit: number): number {
  const presentIndexesAndEnd = [
    ...indexes.filter((index) => index < limit),
    limit,
  ];
  let last = -1;
  let missingIndexes = 0;
  for (const index of presentIndexesAndEnd) {
    missingIndexes += index - last - 1;
    last = index;
  }
  return missingIndexes;
}

Deno.test("countMissingIndexes", () => {
  assertEquals(countMissingIndexes([0, 1, 2, 3, 5, 6], 9), 3);
  assertEquals(countMissingIndexes([0, 1, 2, 3, 5, 6, 9], 9), 3);
  assertEquals(countMissingIndexes([0, 1, 2, 3, 5, 6, 9, 13], 9), 3);
  assertEquals(countMissingIndexes([1, 2, 3, 5, 6], 9), 4);
  assertEquals(countMissingIndexes([2, 3, 5, 6], 9), 5);
  assertEquals(countMissingIndexes([], 9), 9);
});

function expandEmptyColumns(
  galaxies: Coordinate[],
  amount: number,
): Coordinate[] {
  const allColumnsContainingGalaxies = Array.from(
    new Set(galaxies.map((galaxy) => galaxy.x)),
  ).sort((a, b) => a - b);
  return galaxies.map((galaxy) =>
    new Coordinate(
      countMissingIndexes(allColumnsContainingGalaxies, galaxy.x) *
          (amount - 1) + galaxy.x,
      galaxy.y,
    )
  );
}

Deno.test("expandEmptyColumns", () => {
  assertEquals(
    expandEmptyColumns(["0,0", "2,2", "5,2"].map(Coordinate.fromString), 2)
      .map((c) => c.toString()),
    ["0,0", "3,2", "8,2"],
  );
  assertEquals(
    expandEmptyColumns(["0,0", "2,2", "5,2"].map(Coordinate.fromString), 3)
      .map((c) => c.toString()),
    ["0,0", "4,2", "11,2"],
  );
});

function expandEmptyRows(
  galaxies: Coordinate[],
  amount: number,
): Coordinate[] {
  const allRowsContainingGalaxies = Array.from(
    new Set(galaxies.map((galaxy) => galaxy.y)),
  ).sort((a, b) => a - b);
  return galaxies.map((galaxy) =>
    new Coordinate(
      galaxy.x,
      countMissingIndexes(allRowsContainingGalaxies, galaxy.y) *
          (amount - 1) + galaxy.y,
    )
  );
}

Deno.test("expandEmptyRows", () => {
  assertEquals(
    expandEmptyRows(
      ["0,0", "2,2", "5,2", "5,5"].map(Coordinate.fromString),
      2,
    )
      .map((c) => c.toString()),
    ["0,0", "2,3", "5,3", "5,8"],
  );
  assertEquals(
    expandEmptyRows(
      ["0,0", "2,2", "5,2", "5,5"].map(Coordinate.fromString),
      3,
    )
      .map((c) => c.toString()),
    ["0,0", "2,4", "5,4", "5,11"],
  );
});

function* allPairs<T>(items: T[]): Generator<[T, T]> {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      yield [items[i], items[j]];
    }
  }
}

Deno.test("allPairs", () => {
  assertEquals(Array.from(allPairs([])), []);
  assertEquals(Array.from(allPairs([1])), []);
  assertEquals(Array.from(allPairs([1, 2])), [[1, 2]]);
  assertEquals(Array.from(allPairs([1, 2, 3])), [
    [1, 2],
    [1, 3],
    [2, 3],
  ]);
});

function solve(input: string, amount: number): number {
  return allPairs(
    expandEmptyRows(
      expandEmptyColumns(
        linesToGalaxyCoordinates(input.trimEnd().split("\n")),
        amount,
      ),
      amount,
    ),
  )
    .map(([a, b]) => manhattanDistance(a, b))
    .reduce((a, b) => a + b, 0);
}

function part1(input: string): number {
  return solve(input, 2);
}

function part2(input: string): number {
  return solve(input, 1_000_000);
}

if (import.meta.main) {
  runPart(2023, 11, 1, part1);
  runPart(2023, 11, 2, part2);
}

const TEST_INPUT = `\
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 374);
});

Deno.test("solve, amount = 10", () => {
  assertEquals(solve(TEST_INPUT, 10), 1030);
});

Deno.test("solve, amount = 100", () => {
  assertEquals(solve(TEST_INPUT, 100), 8410);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 82000210);
});
