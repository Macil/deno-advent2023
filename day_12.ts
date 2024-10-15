import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

interface Row {
  /** `.` undamaged spring, `#` broken spring, `?` unknown status spring */
  statuses: string;
  brokenSpringGroupLengths: number[];
}

function parse(input: string): Row[] {
  return input.trimEnd().split("\n").map((line): Row => {
    const parts = line.split(/\s+/);
    if (parts.length !== 2) {
      throw new Error(`Invalid line: ${line}`);
    }
    const statuses = parts[0];
    const brokenSpringGroupLengths = parts[1].split(",").map(Number);
    return { statuses, brokenSpringGroupLengths };
  });
}

function countCombinations(row: Row): number {
  if (row.brokenSpringGroupLengths.length === 0) {
    return row.statuses.includes("#") ? 0 : 1;
  }
  if (row.statuses.length === 0) {
    return 0;
  }

  const nextBrokenSpringGroupLength = row.brokenSpringGroupLengths[0];
  const brokenSpringGroupLengthsTail = row.brokenSpringGroupLengths.slice(1);

  let combinations = 0;

  // find locations that could start a group and sum the combinations from each

  const minimumStatusesToFillExpectedBrokenGroupLengths =
    row.brokenSpringGroupLengths.reduce((a, b) => a + b + 1, 0) - 1;

  let lastIndexToConsiderForStart = row.statuses.length -
    minimumStatusesToFillExpectedBrokenGroupLengths;

  const firstKnownBrokenIndex = row.statuses.indexOf("#");
  if (firstKnownBrokenIndex !== -1) {
    lastIndexToConsiderForStart = Math.min(
      lastIndexToConsiderForStart,
      firstKnownBrokenIndex,
    );
  }

  for (
    const maybeBrokenMatch of row.statuses
      .slice(0, lastIndexToConsiderForStart + 1)
      .matchAll(/[#?]/g)
  ) {
    const immediateBrokenMatch = /^[#?]+/.exec(
      row.statuses.slice(maybeBrokenMatch.index),
    );
    if (
      !immediateBrokenMatch ||
      immediateBrokenMatch[0].length < nextBrokenSpringGroupLength
    ) {
      // can't fit the current group here
      continue;
    }
    // check there's no known broken spring at the boundary
    if (
      row.statuses[maybeBrokenMatch.index + nextBrokenSpringGroupLength] === "#"
    ) {
      continue;
    }
    combinations += countCombinations({
      statuses: row.statuses.slice(
        maybeBrokenMatch.index + nextBrokenSpringGroupLength + 1,
      ),
      brokenSpringGroupLengths: brokenSpringGroupLengthsTail,
    });
  }

  return combinations;
}

function part1(input: string): number {
  const rows = parse(input);
  return rows
    .map(countCombinations)
    .reduce((a, b) => a + b, 0);
}

function part2RowTransform(row: Row): Row {
  return {
    statuses: new Array(5)
      .fill(row.statuses)
      .join("?"),
    brokenSpringGroupLengths: new Array(5)
      .fill(row.brokenSpringGroupLengths)
      .flat(),
  };
}

function part2(input: string): number {
  const rows = parse(input);
  return rows
    .map(part2RowTransform)
    .map(countCombinations)
    .reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2023, 12, 1, part1);
  // runPart(2023, 12, 2, part2);
}

const TEST_INPUT = `\
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1
`;

Deno.test("trivial", () => {
  assertEquals(part1(".#...#....###. 1,1,3"), 1);
});

Deno.test("simple", () => {
  assertEquals(part1("???.### 1,1,3"), 1);
});

Deno.test("basic", () => {
  assertEquals(part1(".??..??...?##. 1,1,3"), 4);
});

Deno.test("example line 3", () => {
  assertEquals(part1("?#?#?#?#?#?#?#? 1,3,1,6"), 1);
});

Deno.test("example line 6", () => {
  assertEquals(part1("?###???????? 3,2,1"), 10);
});

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 21);
});

Deno.test("part2 per line", async (t) => {
  const lines = TEST_INPUT.trimEnd().split("\n");
  const answers = [1, 16384, 1, 16, 2500, 506250];
  for (let i = 0; i < answers.length; i++) {
    await t.step(`${i + 1}`, () => {
      assertEquals(part2(lines[i]), answers[i]);
    });
  }
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 525152);
});
