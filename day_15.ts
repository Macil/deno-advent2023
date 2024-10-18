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

interface Lens {
  label: string;
  focalLength: number;
}

interface Step {
  lens: Lens;
  operation: "=" | "-";
}

function parseSteps(input: string): Step[] {
  return input.trimEnd().split(",").map((step): Step => {
    const [label, operation, focalLength] = step.split(/([-=])/);
    return {
      lens: {
        label,
        focalLength: parseInt(focalLength),
      },
      operation: operation as "=" | "-",
    };
  });
}

function scoreBoxes(boxes: Map<number, Lens[]>): number {
  return boxes.entries()
    .filter(([_, lenses]) => lenses.length > 0)
    .map(([boxNumber, lenses]) =>
      lenses
        .map((lens, i) => (1 + boxNumber) * (1 + i) * lens.focalLength)
        .reduce((a, b) => a + b, 0)
    )
    .reduce((a, b) => a + b, 0);
}

function part2(input: string): number {
  const steps = parseSteps(input);
  const boxes = new Map<number, Lens[]>();
  for (const step of steps) {
    const labelHash = hash(step.lens.label);
    let itemsInBox = boxes.get(labelHash) ?? [];
    if (step.operation === "=") {
      const existingLensIndexWithSameLabel = itemsInBox.findIndex(
        (item) => item.label === step.lens.label,
      );
      if (existingLensIndexWithSameLabel !== -1) {
        itemsInBox[existingLensIndexWithSameLabel] = step.lens;
      } else {
        itemsInBox.push(step.lens);
      }
    } else {
      itemsInBox = itemsInBox.filter((item) => item.label !== step.lens.label);
    }
    boxes.set(labelHash, itemsInBox);
  }
  return scoreBoxes(boxes);
}

if (import.meta.main) {
  runPart(2023, 15, 1, part1);
  runPart(2023, 15, 2, part2);
}

const TEST_INPUT = `\
rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 1320);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 145);
});
