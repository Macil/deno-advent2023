import { assertEquals } from "@std/assert";
import { lcm } from "@babia/tiny-math";
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

  let stepCount = 0;
  let stepPathIndex = 0;
  let position = "AAA";

  while (position !== "ZZZ") {
    const step = input.path[stepPathIndex];
    const children = input.nodes[position];
    position = step === "L" ? children[0] : children[1];
    stepCount++;
    stepPathIndex = (stepPathIndex + 1) % input.path.length;
  }

  return stepCount;
}

interface RecurringEncounter {
  firstEncounterStep: number;
  stepsUntilRevisit: number;
}

function calculateFirstCommonEncounter(
  recurringEncounters: ReadonlyArray<RecurringEncounter>,
): number {
  if (
    recurringEncounters.some((e) =>
      e.firstEncounterStep !== e.stepsUntilRevisit
    )
  ) {
    throw new Error(
      "This implementation only supports goals that are re-encountered at a fixed interval.",
    );
  }
  return lcm(...recurringEncounters.map((e) => e.stepsUntilRevisit));
}

Deno.test("calculateFirstCommonEncounter", async (t) => {
  await t.step("basic", () => {
    assertEquals(
      calculateFirstCommonEncounter([
        { firstEncounterStep: 2, stepsUntilRevisit: 2 },
        { firstEncounterStep: 3, stepsUntilRevisit: 3 },
      ]),
      6,
    );
    // assertEquals(
    //   calculateFirstCommonEncounter([
    //     { firstEncounterStep: 2, stepsUntilRevisit: 2 },
    //     { firstEncounterStep: 5, stepsUntilRevisit: 3 },
    //   ]),
    //   8,
    // );
  });
  await t.step("large values", () => {
    assertEquals(
      calculateFirstCommonEncounter([
        { firstEncounterStep: 21409, stepsUntilRevisit: 21409 },
        { firstEncounterStep: 14363, stepsUntilRevisit: 14363 },
        { firstEncounterStep: 15989, stepsUntilRevisit: 15989 },
        { firstEncounterStep: 16531, stepsUntilRevisit: 16531 },
        { firstEncounterStep: 19241, stepsUntilRevisit: 19241 },
        { firstEncounterStep: 19783, stepsUntilRevisit: 19783 },
      ]),
      21165830176709,
    );
  });
});

function calculateFirstCommonEncounterAmongPathers(
  recurringGoalEncountersByPather: ReadonlyArray<
    ReadonlyArray<RecurringEncounter>
  >,
): number {
  if (
    recurringGoalEncountersByPather.some((encountersSet) =>
      encountersSet.length !== 1
    )
  ) {
    throw new Error(
      "This implementation only supports paths that encounter a single goal repeatedly.",
    );
  }
  return calculateFirstCommonEncounter(
    recurringGoalEncountersByPather.map((e) => e[0]!),
  );
}

interface PathFollower {
  position: string;
  firstGoalEncounters: Map<string, number>;
  /**
   * This will be set to the complete Map once the pather has recognized it has
   * entered a loop.
   */
  recurringGoalEncounters: Map<string, RecurringEncounter> | undefined;
}

function isPositionGoal(position: string): boolean {
  return position.endsWith("Z");
}

function part2(inputStr: string): number {
  const input = parse(inputStr);

  let stepCount = 0;
  let stepPathIndex = 0;
  const pathers: PathFollower[] = Object.keys(input.nodes)
    .filter((key) => key.endsWith("A"))
    .map((key) => ({
      position: key,
      firstGoalEncounters: new Map(),
      recurringGoalEncounters: undefined,
    }));

  while (true) {
    if (pathers.every((pos) => isPositionGoal(pos.position))) {
      return stepCount;
    }

    if (
      pathers.every((pather) => pather.recurringGoalEncounters !== undefined)
    ) {
      return calculateFirstCommonEncounterAmongPathers(
        pathers.map((p) => Array.from(p.recurringGoalEncounters!.values())),
      );
    }

    const step = input.path[stepPathIndex];
    stepCount++;
    stepPathIndex = (stepPathIndex + 1) % input.path.length;
    for (const pather of pathers) {
      const children = input.nodes[pather.position];
      pather.position = step === "L" ? children[0] : children[1];

      if (!pather.recurringGoalEncounters && isPositionGoal(pather.position)) {
        const firstEncounterStep = pather.firstGoalEncounters.get(
          pather.position,
        );
        if (firstEncounterStep === undefined) {
          pather.firstGoalEncounters.set(pather.position, stepCount);
        } else {
          pather.recurringGoalEncounters = new Map(
            Array.from(pather.firstGoalEncounters)
              .map(([otherPosition, otherFirstEncounterStep]) => [
                otherPosition,
                {
                  firstEncounterStep: otherFirstEncounterStep,
                  stepsUntilRevisit: stepCount - firstEncounterStep,
                },
              ]),
          );
        }
      }
    }
  }
}

if (import.meta.main) {
  runPart(2023, 8, 1, part1);
  runPart(2023, 8, 2, part2);
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

const TEST_INPUT4 = `\
LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22M, 22M)
22M = (22N, 22N)
22N = (22B, XXX)
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
  assertEquals(part2(TEST_INPUT4), 8);
});
