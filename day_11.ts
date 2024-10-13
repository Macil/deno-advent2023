import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { Coordinate, manhattanDistance } from "./lib/Coordinate.ts";

function expandEmptyColumns(world: string[]): string[] {
  if (world.length === 0) {
    return world;
  }
  const rowLength = world[0].length;
  const columnsToExpand: number[] = [];
  for (let i = 0; i < rowLength; i++) {
    if (world.every((row) => row[i] === ".")) {
      columnsToExpand.push(i);
    }
  }
  if (columnsToExpand.length === 0) {
    return world;
  }
  return world.map((row) =>
    [
      ...columnsToExpand.flatMap((
        column,
        i,
      ) => [
        row.slice(i === 0 ? 0 : columnsToExpand[i - 1] + 1, column + 1),
        ".",
      ]),
      row.slice(columnsToExpand.at(-1)! + 1),
    ].join("")
  );
}

Deno.test("expandEmptyColumns", () => {
  assertEquals(expandEmptyColumns(["..", ".."]), ["....", "...."]);
  assertEquals(expandEmptyColumns(["..", "#.", ".."]), ["...", "#..", "..."]);
  assertEquals(expandEmptyColumns(["#.", ".#", ".."]), ["#.", ".#", ".."]);
});

function expandEmptyRows(world: string[]): string[] {
  return world.flatMap((row) => {
    if (/^\.*$/.test(row)) {
      return [row, row];
    } else {
      return [row];
    }
  });
}

Deno.test("expandEmptyRows", () => {
  assertEquals(expandEmptyRows(["..", ".."]), ["..", "..", "..", ".."]);
  assertEquals(expandEmptyRows(["..", "#.", ".."]), [
    "..",
    "..",
    "#.",
    "..",
    "..",
  ]);
});

function worldToGalaxyCoordinates(world: string[]): Coordinate[] {
  return world.flatMap((row, y) =>
    Array.from(row).flatMap((cell, x) =>
      cell === "#" ? [new Coordinate(x, y)] : []
    )
  );
}

Deno.test("worldToGalaxyCoordinates", () => {
  assertEquals(worldToGalaxyCoordinates([".#.", "#.#"]), [
    new Coordinate(1, 0),
    new Coordinate(0, 1),
    new Coordinate(2, 1),
  ]);
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

function part1(input: string): number {
  return allPairs(
    worldToGalaxyCoordinates(
      expandEmptyRows(
        expandEmptyColumns(
          input.trimEnd().split("\n"),
        ),
      ),
    ),
  )
    .map(([a, b]) => manhattanDistance(a, b))
    .reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 11, 1, part1);
  // runPart(2023, 11, 2, part2);
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

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
