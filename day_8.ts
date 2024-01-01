import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

type PathStep = "L" | "R";

interface Input {
  path: PathStep[];
  nodes: Record<string, string[]>;
}

function parse(input: string): Input {
  const lines = input.trimEnd().split("\n");
  const path = Array.from(lines[0]) as PathStep[];
  const nodes: Record<string, string[]> = {};
  for (const line of lines.slice(2)) {
    const [parent, children] = line.split(" = ");
    nodes[parent] = children
      .slice(1, -1)
      .split(", ")
      .map((child) => child.trim());
  }
  return { path, nodes };
}

function part1(inputStr: string): number {
  const input = parse(inputStr);

  let steps = 0;
  let stepIndex = 0;
  let position = "AAA";

  while (position !== "ZZZ") {
    const step = input.path[stepIndex];
    const children = input.nodes[position];
    if (step === "L") {
      position = children[0];
    } else {
      position = children[1];
    }
    steps++;
    stepIndex = (stepIndex + 1) % input.path.length;
  }

  return steps;
}

// function part2(inputStr: string): number {
//   const input = parse(inputStr);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 8, 1, part1);
  // runPart(2023, 8, 2, part2);
}

const TEST_INPUT = `\
RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)
`;

const TEST_INPUT2 = `\
LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 2);
  assertEquals(part1(TEST_INPUT2), 6);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
