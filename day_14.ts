import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

type Tile = "." | "O" | "#";

function parse(input: string): Tile[][] {
  return input.trimEnd().split("\n").map((line) => Array.from(line) as Tile[]);
}

function tiltNorth(tiles: Tile[][]) {
  for (let y = 1; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      let cy = y;
      while (cy > 0 && tiles[cy][x] === "O" && tiles[cy - 1][x] === ".") {
        tiles[cy - 1][x] = "O";
        tiles[cy][x] = ".";
        cy--;
      }
    }
  }
}

function calculateLoad(tiles: Tile[][]): number {
  return tiles
    .map((row, i) =>
      row.filter((tile) => tile === "O").length * (tiles.length - i)
    )
    .reduce((a, b) => a + b, 0);
}

function part1(input: string): number {
  const tiles = parse(input);
  tiltNorth(tiles);
  return calculateLoad(tiles);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 14, 1, part1);
  // runPart(2023, 14, 2, part2);
}

const TEST_INPUT = `\
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 136);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
