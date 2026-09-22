import type { Difficulty } from './types'

export const DEFAULT_DIFFICULTY: Difficulty = {
  rows: 9,
  cols: 9,
  mines: 10,
}

export const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]
