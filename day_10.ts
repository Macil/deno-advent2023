import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
import { Coordinate } from "./lib/Coordinate.ts";

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
      return new Coordinate(coordinate.x, coordinate.y - 1);
    case "S":
      return new Coordinate(coordinate.x, coordinate.y + 1);
    case "W":
      return new Coordinate(coordinate.x - 1, coordinate.y);
    case "E":
      return new Coordinate(coordinate.x + 1, coordinate.y);
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
};

class World {
  readonly #lines: string[];
  readonly startCoordinate: Coordinate;
  constructor(input: string) {
    this.#lines = input.trimEnd().split("\n");
    this.startCoordinate = (() => {
      for (let i = 0; i < this.#lines.length; i++) {
        const startX = this.#lines[i].indexOf("S");
        if (startX !== -1) {
          return new Coordinate(startX, i);
        }
      }
      throw new Error("Could not find start coordinate.");
    })();
    // Replace S tile with correct tile
    {
      const startNodeConnections: Direction[] = [];
      const ALL_DIRECTIONS: ReadonlyArray<Direction> = ["N", "S", "W", "E"];
      for (const direction of ALL_DIRECTIONS) {
        const neighbor = step(this.startCoordinate, direction);
        const neighborTile = this.tileAt(neighbor);
        if (!neighborTile) {
          continue;
        }
        const neighborConnections = CONNECTIONS_FROM_TILE[neighborTile];
        if (!neighborConnections) {
          continue;
        }
        if (
          !neighborConnections.includes(oppositeDirection(direction))
        ) {
          continue;
        }
        startNodeConnections.push(direction);
      }
      const startNodeConnectionsString = startNodeConnections.sort().join("");
      const effectiveStartTile = Object.entries(CONNECTIONS_FROM_TILE).find(
        ([_tile, connections]) =>
          connections.length === startNodeConnections.length &&
          startNodeConnectionsString === connections.toSorted().join(""),
      )![0];
      this.#lines[this.startCoordinate.y] =
        this.#lines[this.startCoordinate.y].slice(0, this.startCoordinate.x) +
        effectiveStartTile +
        this.#lines[this.startCoordinate.y].slice(this.startCoordinate.x + 1);
    }
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
      yield step(coordinate, connection);
    }
  }
  *getNodesInLoop(startCoordinate: Coordinate): Generator<Coordinate> {
    let prevNode: Coordinate | undefined;
    let currentNode = startCoordinate;
    outer: do {
      yield currentNode;
      for (const neighbor of this.getNeighbors(currentNode)) {
        if (prevNode && neighbor.equals(prevNode)) {
          continue;
        }
        prevNode = currentNode;
        currentNode = neighbor;
        continue outer;
      }
      throw new Error("No unvisited neighbors.");
    } while (!currentNode.equals(startCoordinate));
  }
}

function part1(input: string): number {
  const world = new World(input);
  return Array.from(world.getNodesInLoop(world.startCoordinate)).length / 2;
}

// consider our position to be the bottom right corner of the tile, and that
// we've just moved from the tile to the left.
const INSIDE_CHANGERS = ["|", "7", "F"];

function part2(input: string): number {
  const world = new World(input);

  const nwMostCoordinate = world.startCoordinate.clone();
  const seMostCoordinate = world.startCoordinate.clone();

  const loopNodes = new Set<string>();

  for (const node of world.getNodesInLoop(world.startCoordinate)) {
    if (nwMostCoordinate.x > node.x) {
      nwMostCoordinate.x = node.x;
    }
    if (nwMostCoordinate.y > node.y) {
      nwMostCoordinate.y = node.y;
    }
    if (seMostCoordinate.x < node.x) {
      seMostCoordinate.x = node.x;
    }
    if (seMostCoordinate.y < node.y) {
      seMostCoordinate.y = node.y;
    }
    loopNodes.add(node.toString());
  }

  let enclosedTiles = 0;
  const coordinate = nwMostCoordinate.clone();
  for (; coordinate.y <= seMostCoordinate.y; coordinate.y++) {
    let inside = false;
    for (
      coordinate.x = nwMostCoordinate.x;
      coordinate.x <= seMostCoordinate.x;
      coordinate.x++
    ) {
      const tile = world.tileAt(coordinate)!;
      if (loopNodes.has(coordinate.toString())) {
        if (INSIDE_CHANGERS.includes(tile)) {
          inside = !inside;
        }
      } else if (inside) {
        enclosedTiles++;
      }
    }
    if (inside) {
      throw new Error("inside should be false at the end of each row.");
    }
  }
  return enclosedTiles;
}

if (import.meta.main) {
  runPart(2023, 10, 1, part1);
  runPart(2023, 10, 2, part2);
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

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 1);
  assertEquals(
    part2(`\
...........
.S-------7.
.|F-----7|.
.||.....||.
.||.....||.
.|L-7.F-J|.
.|..|.|..|.
.L--J.L--J.
...........
`),
    4,
  );
  assertEquals(
    part2(`\
.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...
`),
    8,
  );
  assertEquals(
    part2(`\
FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L
`),
    10,
  );
});
