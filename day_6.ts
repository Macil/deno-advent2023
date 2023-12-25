import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { zip } from "https://deno.land/std@0.210.0/collections/zip.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

interface Race {
  time: number;
  distance: number;
}

function parse(input: string): Race[] {
  const lines = input.trimEnd().split("\n");
  assertEquals(lines.length, 2);
  return zip(
    ...lines.map((line) => line.split(":")[1].trim().split(/\s+/).map(Number)),
  ).map(([time, distance]) => ({ time, distance }));
}

function countWaysToWin(race: Race): number {
  const maxTimeHeld = Math.ceil(
    (race.time + Math.sqrt(race.time ** 2 - 4 * race.distance)) / 2 - 1,
  );
  const minTimeHeld = Math.floor(
    (race.time - Math.sqrt(race.time ** 2 - 4 * race.distance)) / 2 + 1,
  );
  return maxTimeHeld - minTimeHeld + 1;
}

function part1(input: string): number {
  const data = parse(input);
  return data.map(countWaysToWin).reduce((a, b) => a * b, 1);
}

// function part2(input: string): number {
//   const data = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 6, 1, part1);
  // runPart(2023, 6, 2, part2);
}

const TEST_INPUT = `\
Time:      7  15   30
Distance:  9  40  200
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 288);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
