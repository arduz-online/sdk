
export function getRandomInteger(min: number, max: number) {
  return Math.round(Math.random() * (max - min)) + min;
}

export function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}
