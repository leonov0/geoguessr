export const MAP_WIDTH = 2048;
export const MAP_HEIGHT = 1024;
export const ROUNDS_PER_GAME = 5;
export const ROUND_TIME_SECONDS = 60;
export const MAX_POINTS_PER_ROUND = 1000;
export const MAP_DIAGONAL = Math.sqrt(MAP_WIDTH ** 2 + MAP_HEIGHT ** 2);

export function computeDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
}

export function computePoints(distance: number): number {
  return Math.max(
    0,
    Math.round(MAX_POINTS_PER_ROUND * (1 - distance / MAP_DIAGONAL)),
  );
}
