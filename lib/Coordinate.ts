export class Coordinate {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  static fromString(string: string): Coordinate {
    const parts = string.split(",");
    if (parts.length !== 2) {
      throw new Error("Invalid coordinate string.");
    }
    const [x, y] = parts.map(Number);
    return new Coordinate(x, y);
  }
  add(other: Coordinate): Coordinate {
    return new Coordinate(this.x + other.x, this.y + other.y);
  }
  equals(other: Coordinate): boolean {
    return this.x === other.x && this.y === other.y;
  }
  toString(): string {
    return `${this.x},${this.y}`;
  }
  clone(): Coordinate {
    return new Coordinate(this.x, this.y);
  }
}

export function manhattanDistance(a: Coordinate, b: Coordinate): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
