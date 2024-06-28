import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

interface Subset {
  red: number;
  green: number;
  blue: number;
}

interface Game {
  id: number;
  subsets: Subset[];
}

function parse(input: string): Game[] {
  return input.trimEnd().split("\n").map((line) => {
    const [header, rest] = line.split(":");
    const id = Number(/^Game (\d+)$/.exec(header)![1]);
    const subsets = rest.split(";").map((subsetStr) => {
      const subset: Subset = { red: 0, green: 0, blue: 0 };
      for (const colorPart of subsetStr.split(",")) {
        const [count, color] = colorPart.trimStart().split(" ");
        subset[color as keyof Subset] = Number(count);
      }
      return subset;
    });
    return { id, subsets };
  });
}

function part1(input: string): number {
  const games = parse(input);
  return games
    .filter((game) =>
      game.subsets.every((subset) =>
        subset.red <= 12 && subset.green <= 13 && subset.blue <= 14
      )
    )
    .reduce((sum, game) => sum + game.id, 0);
}

function minimumSubset(game: Game): Subset {
  const minimumSubset: Subset = { red: 0, green: 0, blue: 0 };
  for (const subset of game.subsets) {
    for (const color of ["red", "green", "blue"] as const) {
      minimumSubset[color] = Math.max(minimumSubset[color], subset[color]);
    }
  }
  return minimumSubset;
}

function power(subset: Subset): number {
  return subset.red * subset.green * subset.blue;
}

function part2(input: string): number {
  const games = parse(input);
  return games
    .map(minimumSubset)
    .map(power)
    .reduce((sum, power) => sum + power, 0);
}

if (import.meta.main) {
  runPart(2023, 2, 1, part1);
  runPart(2023, 2, 2, part2);
}

const TEST_INPUT = `\
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 8);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 2286);
});
