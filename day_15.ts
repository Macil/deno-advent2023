import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

function hash(input: string): number {
  let currentValue = 0;
  for (let i = 0; i < input.length; i++) {
    currentValue += input.charCodeAt(i);
    currentValue = currentValue * 17 % 256;
  }
  return currentValue;
}

function part1(input: string): number {
  return input.trimEnd().split(",").map(hash).reduce((a, b) => a + b, 0);
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 15, 1, part1);
  // runPart(2023, 15, 2, part2);
}

const TEST_INPUT = `\
rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 1320);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
