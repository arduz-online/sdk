import { Heading } from "../Enums";

export function headToPos(x: number, y: number, heading: Heading): { x: number; y: number } {
  switch (heading) {
    case Heading.East:
      return {
        x: x + 1,
        y: y,
      };
    case Heading.West:
      return {
        x: x - 1,
        y: y,
      };
    case Heading.North:
      return {
        x: x,
        y: y - 1,
      };
    case Heading.South:
      return {
        x: x,
        y: y + 1,
      };
  }

  return {
    x,
    y,
  };
}
