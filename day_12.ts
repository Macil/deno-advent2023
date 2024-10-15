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
  function combinationsIfGroupStartsHere(): number {
    const m = /^[#?]+/.exec(row.statuses);
    if (!m || m[0].length < row.brokenSpringGroupLengths[0]) {
      // can't start a group here
      return 0;
    }
    // check there's no known broken spring at the boundary
    if (row.statuses[row.brokenSpringGroupLengths[0]] === "#") {
      return 0;
    }
    return countCombinations({
      statuses: row.statuses.slice(row.brokenSpringGroupLengths[0] + 1),
      brokenSpringGroupLengths: row.brokenSpringGroupLengths.slice(1),
    });
  }
  function combinationsIfGroupStartsLater(): number {
    if (row.statuses[0] === "#") {
      // can't start later
      return 0;
    }
    const m = /[#?]/.exec(row.statuses.slice(1));
    if (!m) {
      // no more groups
      return 0;
    }
    return countCombinations({
      statuses: row.statuses.slice(m.index + 1),
      brokenSpringGroupLengths: row.brokenSpringGroupLengths,
    });
  }
  return combinationsIfGroupStartsHere() + combinationsIfGroupStartsLater();
}

function part1(input: string): number {
  const rows = parse(input);
  return rows
    .map(countCombinations)
    .reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const rows = parse(input);
//   throw new Error("TODO");
// }

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

Deno.test("example line 5", () => {
  assertEquals(part1("?###???????? 3,2,1"), 10);
});

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 21);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
