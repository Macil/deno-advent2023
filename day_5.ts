import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { StaticIntervalTree } from "npm:mnemonist@0.39.6";
import { chunk } from "@std/collections/chunk";

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

function createInputMap(
  from: string,
  to: string,
  ranges: ConversionRange[],
): InputMap {
  return {
    from,
    to,
    ranges,
    intervalTree: StaticIntervalTree.from(ranges, [
      (range) => range.sourceStart,
      rangeEnd,
    ]),
  };
}

interface ConversionRange {
  destStart?: number;
  sourceStart: number;
  length: number;
}

/** Gets the inclusive source end of a range */
function rangeEnd(range: ConversionRange): number {
  return range.sourceStart + range.length - 1;
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
    return createInputMap(from, to, ranges);
  });
  return { seeds, maps };
}

function mapValue(value: number, inputMap: InputMap): number {
  const conversionRange =
    inputMap.intervalTree.intervalsContainingPoint(value)[0];
  if (conversionRange) {
    return conversionRange.destStart! + (value - conversionRange.sourceStart);
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

function mapRange(
  range: ConversionRange,
  inputMap: InputMap,
): ConversionRange[] {
  const relevantConversionRanges = inputMap.intervalTree
    .intervalsOverlappingInterval(range)
    .toSorted((a, b) => a.sourceStart - b.sourceStart);
  // Assuming none of the conversion ranges overlap with each other.

  // Clip them to the original range.
  const clippedRelevantConversionRanges = relevantConversionRanges.map(
    (relevantConversionRange) => {
      const sourceStart = Math.max(
        relevantConversionRange.sourceStart,
        range.sourceStart,
      );
      const sourceEnd = Math.min(
        rangeEnd(relevantConversionRange),
        rangeEnd(range),
      );
      return {
        destStart: relevantConversionRange.destStart! +
          (sourceStart - relevantConversionRange.sourceStart),
        sourceStart,
        length: sourceEnd - sourceStart + 1,
      };
    },
  );

  // Need to fill in the gaps between the conversion ranges so that all numbers
  // in the original range get converted to something.
  const effectiveConversionRanges: ConversionRange[] = [];
  let currentPosition = range.sourceStart;
  for (const relevantConversionRange of clippedRelevantConversionRanges) {
    if (relevantConversionRange.sourceStart > currentPosition) {
      effectiveConversionRanges.push({
        destStart: currentPosition,
        sourceStart: currentPosition,
        length: relevantConversionRange.sourceStart - currentPosition,
      });
    }
    effectiveConversionRanges.push(relevantConversionRange);
    currentPosition = rangeEnd(relevantConversionRange) + 1;
  }
  if (currentPosition <= rangeEnd(range)) {
    effectiveConversionRanges.push({
      destStart: currentPosition,
      sourceStart: currentPosition,
      length: rangeEnd(range) - currentPosition + 1,
    });
  }

  // Create ranges based on the applied conversions.
  const results = effectiveConversionRanges.map((conversionRange) => ({
    sourceStart: conversionRange.destStart! +
      Math.max(0, range.sourceStart - conversionRange.sourceStart),
    length: conversionRange.length,
  }));

  return results;
}

function part2(input: string): number {
  const inputData = parse(input);
  const seedRanges: ConversionRange[] = chunk(inputData.seeds, 2)
    .map(([start, length]) => ({ sourceStart: start, length }));
  const locationRanges = seedRanges.flatMap((seedRange) =>
    inputData.maps.reduce(
      (ranges, inputMap) =>
        ranges.flatMap((range) => mapRange(range, inputMap)),
      [seedRange],
    )
  );
  return Math.min(...locationRanges.map((range) => range.sourceStart));
}

if (import.meta.main) {
  runPart(2023, 5, 1, part1);
  runPart(2023, 5, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 46);
});
