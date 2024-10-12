import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

interface Coordinate {
  x: number;
  y: number;
}

function areCoordinatesEqual(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

type Direction = "N" | "S" | "W" | "E";

function oppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case "N":
      return "S";
    case "S":
      return "N";
    case "W":
      return "E";
    case "E":
      return "W";
  }
}

function step(
  coordinate: Coordinate,
  direction: Direction,
): Coordinate {
  switch (direction) {
    case "N":
      return { x: coordinate.x, y: coordinate.y - 1 };
    case "S":
      return { x: coordinate.x, y: coordinate.y + 1 };
    case "W":
      return { x: coordinate.x - 1, y: coordinate.y };
    case "E":
      return { x: coordinate.x + 1, y: coordinate.y };
  }
}

const CONNECTIONS_FROM_TILE: Record<string, ReadonlyArray<Direction>> = {
  "|": ["N", "S"],
  "-": ["W", "E"],
  L: ["N", "E"],
  J: ["N", "W"],
  7: ["S", "W"],
  F: ["S", "E"],
  ".": [],
  S: ["N", "S", "W", "E"],
};

class World {
  readonly #lines: string[];
  readonly startCoordinate: Coordinate;
  constructor(input: string) {
    this.#lines = input.trimEnd().split("\n");
    this.startCoordinate = (() => {
      for (let i = 0; i < this.#lines.length; i++) {
        const startCoordinate = this.#lines[i].indexOf("S");
        if (startCoordinate !== -1) {
          return { x: startCoordinate, y: i };
        }
      }
      throw new Error("Could not find start coordinate.");
    })();
  }
  tileAt(coordinate: Coordinate): string | undefined {
    return this.#lines[coordinate.y]?.[coordinate.x];
  }
  *getNeighbors(coordinate: Coordinate): Generator<Coordinate> {
    const tile = this.tileAt(coordinate);
    if (!tile) {
      return;
    }
    const connections = CONNECTIONS_FROM_TILE[tile];
    if (!connections) {
      return;
    }
    for (const connection of connections) {
      const neighbor = step(coordinate, connection);
      if (tile === "S") {
        const neighborTile = this.tileAt(neighbor);
        if (!neighborTile) {
          continue;
        }
        const neighborConnections = CONNECTIONS_FROM_TILE[neighborTile];
        if (!neighborConnections) {
          continue;
        }
        if (!neighborConnections.includes(oppositeDirection(connection))) {
          continue;
        }
      }
      yield neighbor;
    }
  }
  *getNodesInLoop(startCoordinate: Coordinate): Generator<Coordinate> {
    let prevNode: Coordinate | undefined;
    let currentNode = startCoordinate;
    outer: do {
      yield currentNode;
      for (const neighbor of this.getNeighbors(currentNode)) {
        if (prevNode && areCoordinatesEqual(neighbor, prevNode)) {
          continue;
        }
        prevNode = currentNode;
        currentNode = neighbor;
        continue outer;
      }
      throw new Error("No unvisited neighbors.");
    } while (!areCoordinatesEqual(currentNode, startCoordinate));
  }
}

function part1(input: string): number {
  const world = new World(input);
  return Array.from(world.getNodesInLoop(world.startCoordinate)).length / 2;
}

// function part2(input: string): number {
//   const world = new World(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2023, 10, 1, part1);
  // runPart(2023, 10, 2, part2);
}

const TEST_INPUT = `\
7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 8);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
