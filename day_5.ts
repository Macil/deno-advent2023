import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";
import { StaticIntervalTree } from "npm:mnemonist@0.39.6";

interface InputData {
  seeds: number[];
  maps: InputMap[];
}

interface InputMap {
  from: string;
  to: string;
  ranges: ConversionRange[];
  intervalTree: StaticIntervalTree<ConversionRange>;
}

interface ConversionRange {
  destStart: number;
  sourceStart: number;
  length: number;
}

function parse(input: string): InputData {
  const fullMatch = /^seeds: ((?:\d+ )*\d+)\n\n(.*)$/s.exec(input.trimEnd());
  if (!fullMatch) throw new Error("Invalid input");

  const seeds = fullMatch[1].split(" ").map(Number);
  const mapParts = fullMatch[2].split("\n\n");
  const maps = mapParts.map((mapPart): InputMap => {
    const mapLines = mapPart.split("\n");
    const firstMatch = /^(\w+)-to-(\w+) map:$/.exec(mapLines[0]);
    if (!firstMatch) throw new Error("Invalid map header");
    const from = firstMatch[1];
    const to = firstMatch[2];
    const ranges = mapLines.slice(1).map((line) => {
      const numbers = line.split(" ").map(Number);
      if (numbers.length !== 3) throw new Error("Invalid map line");
      return {
        destStart: numbers[0],
        sourceStart: numbers[1],
        length: numbers[2],
      };
    });
    return {
      from,
      to,
      ranges,
      intervalTree: StaticIntervalTree.from(ranges, [
        (range) => range.sourceStart,
        (range) => range.sourceStart + range.length - 1,
      ]),
    };
  });
  return { seeds, maps };
}

function mapValue(value: number, inputMap: InputMap): number {
  const conversionRange =
    inputMap.intervalTree.intervalsContainingPoint(value)[0];
  if (conversionRange) {
    return conversionRange.destStart + (value - conversionRange.sourceStart);
  } else {
    return value;
  }
}

function part1(input: string): number {
  const inputData = parse(input);
  const locations = inputData.seeds.map((seed) =>
    inputData.maps.reduce(
      (value, inputMap) => mapValue(value, inputMap),
      seed,
    )
  );
  return Math.min(...locations);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 5, 1, part1);
  // runPart(2023, 5, 2, part2);
}

const TEST_INPUT = `\
seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 35);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
