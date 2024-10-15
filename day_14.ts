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

function tiltSouth(tiles: Tile[][]) {
  for (let y = tiles.length - 2; y >= 0; y--) {
    for (let x = 0; x < tiles[y].length; x++) {
      let cy = y;
      while (
        cy < tiles.length - 1 && tiles[cy][x] === "O" &&
        tiles[cy + 1][x] === "."
      ) {
        tiles[cy + 1][x] = "O";
        tiles[cy][x] = ".";
        cy++;
      }
    }
  }
}

function tiltWest(tiles: Tile[][]) {
  for (let x = 1; x < tiles[0].length; x++) {
    for (let y = 0; y < tiles.length; y++) {
      let cx = x;
      while (cx > 0 && tiles[y][cx] === "O" && tiles[y][cx - 1] === ".") {
        tiles[y][cx - 1] = "O";
        tiles[y][cx] = ".";
        cx--;
      }
    }
  }
}

function tiltEast(tiles: Tile[][]) {
  for (let x = tiles[0].length - 2; x >= 0; x--) {
    for (let y = 0; y < tiles.length; y++) {
      let cx = x;
      while (
        cx < tiles[0].length - 1 && tiles[y][cx] === "O" &&
        tiles[y][cx + 1] === "."
      ) {
        tiles[y][cx + 1] = "O";
        tiles[y][cx] = ".";
        cx++;
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

function tilesToString(tiles: Tile[][]): string {
  return tiles.map((row) => row.join("")).join("\n");
}

function runCycles(tiles: Tile[][], cycles: number) {
  const configurationMinCycleCounts = new Map<string, number>();

  for (let i = 0; i < cycles; i++) {
    const tileStr = tilesToString(tiles);
    if (configurationMinCycleCounts.has(tileStr)) {
      const cycleCount = i - configurationMinCycleCounts.get(tileStr)!;
      const remainingCycles = cycles - i;
      const remainingCycleCount = remainingCycles % cycleCount;
      for (let j = 0; j < remainingCycleCount; j++) {
        tiltNorth(tiles);
        tiltWest(tiles);
        tiltSouth(tiles);
        tiltEast(tiles);
      }
      break;
    } else {
      configurationMinCycleCounts.set(tileStr, i);
    }
    tiltNorth(tiles);
    tiltWest(tiles);
    tiltSouth(tiles);
    tiltEast(tiles);
  }
}

function part2(input: string): number {
  const tiles = parse(input);
  runCycles(tiles, 1000000000);
  return calculateLoad(tiles);
}

if (import.meta.main) {
  runPart(2023, 14, 1, part1);
  runPart(2023, 14, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 64);
});
