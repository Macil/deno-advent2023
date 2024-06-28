import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

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
    position = step === "L" ? children[0] : children[1];
    steps++;
    stepIndex = (stepIndex + 1) % input.path.length;
  }

  return steps;
}

function part2(inputStr: string): number {
  const input = parse(inputStr);

  let steps = 0;
  let stepIndex = 0;
  let positions = Object.keys(input.nodes).filter((key) => key.endsWith("A"));

  while (!positions.every((pos) => pos.endsWith("Z"))) {
    const step = input.path[stepIndex];
    positions = positions.map((position) => {
      const children = input.nodes[position];
      return step === "L" ? children[0] : children[1];
    });
    steps++;
    stepIndex = (stepIndex + 1) % input.path.length;
  }

  return steps;
}

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

const TEST_INPUT3 = `\
LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 2);
  assertEquals(part1(TEST_INPUT2), 6);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT3), 6);
});
