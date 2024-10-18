import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { ComplexKeyMap } from "./lib/ComplexKeyMap.ts";
import { Coordinate } from "./lib/Coordinate.ts";

type Direction = "U" | "D" | "L" | "R";

function directionToCoordinate(direction: Direction): Coordinate {
  switch (direction) {
    case "U":
      return new Coordinate(0, -1);
    case "D":
      return new Coordinate(0, 1);
    case "L":
      return new Coordinate(-1, 0);
    case "R":
      return new Coordinate(1, 0);
  }
}

function beamDirectionsAfterTile(
  direction: Direction,
  tile: string,
): Direction[] {
  switch (tile) {
    case ".": {
      return [direction];
    }
    case "/": {
      switch (direction) {
        case "U":
          return ["R"];
        case "D":
          return ["L"];
        case "L":
          return ["D"];
        case "R":
          return ["U"];
        default:
          throw new Error("Invalid direction");
      }
    }
    case "\\": {
      switch (direction) {
        case "U":
          return ["L"];
        case "D":
          return ["R"];
        case "L":
          return ["U"];
        case "R":
          return ["D"];
        default:
          throw new Error("Invalid direction");
      }
    }
    case "|": {
      switch (direction) {
        case "U":
          return ["U"];
        case "D":
          return ["D"];
        case "L":
          return ["U", "D"];
        case "R":
          return ["U", "D"];
        default:
          throw new Error("Invalid direction");
      }
    }
    case "-": {
      switch (direction) {
        case "U":
          return ["L", "R"];
        case "D":
          return ["L", "R"];
        case "L":
          return ["L"];
        case "R":
          return ["R"];
        default:
          throw new Error("Invalid direction");
      }
    }
    default:
      throw new Error("Invalid tile");
  }
}

interface CellEnergyState {
  beams: Set<Direction>;
}

class World {
  readonly geometry: string[];
  readonly state = new ComplexKeyMap<Coordinate, CellEnergyState>(
    (c) => c.toString(),
  );
  constructor(geometry: string[]) {
    this.geometry = geometry;
    for (let y = 0; y < geometry.length; y++) {
      for (let x = 0; x < geometry[y].length; x++) {
        this.state.set(new Coordinate(x, y), {
          beams: new Set(),
        });
      }
    }
  }
  run() {
    const beams: Array<[Coordinate, Direction]> = [[new Coordinate(0, 0), "R"]];
    while (beams.length > 0) {
      const [coordinate, direction] = beams.pop()!;
      const state = this.state.get(coordinate);
      if (state === undefined) {
        continue;
      }
      if (state.beams.has(direction)) {
        continue;
      }
      state.beams.add(direction);
      const cell = this.geometry[coordinate.y][coordinate.x];
      const newBeamDirections = beamDirectionsAfterTile(direction, cell);
      for (const newBeamDirection of newBeamDirections) {
        beams.push([
          coordinate.add(directionToCoordinate(newBeamDirection)),
          newBeamDirection,
        ]);
      }
    }
  }
  printEnergyState() {
    for (let y = 0; y < this.geometry.length; y++) {
      let line = "";
      for (let x = 0; x < this.geometry[y].length; x++) {
        const state = this.state.get(new Coordinate(x, y));
        if (state === undefined) {
          throw new Error("No state");
        }
        line += state.beams.size === 0 ? "." : "#";
      }
      console.log(line);
    }
  }
  countEnergizedCells(): number {
    return this.state.values()
      .filter((state) => state.beams.size > 0)
      .reduce((count) => count + 1, 0);
  }
}

function part1(input: string): number {
  const world = new World(input.trimEnd().split("\n"));
  world.run();
  return world.countEnergizedCells();
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 16, 1, part1);
  // runPart(2023, 16, 2, part2);
}

const TEST_INPUT = String.raw`
.|...\....
|.-.\.....
.....|-...
........|.
..........
.........\
..../.\\..
.-.-/..|..
.|....-|.\
..//.|....
`.slice(1);

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 46);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
