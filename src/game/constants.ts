import type { DifficultyKey, DifficultyOption } from './types'

export const DIFFICULTIES: Record<DifficultyKey, DifficultyOption> = {
  easy: {
    key: 'easy',
    label: '简单',
    rows: 9,
    cols: 9,
    mines: 10,
  },
  normal: {
    key: 'normal',
    label: '正常',
    rows: 10,
    cols: 10,
    mines: 20,
  },
  hard: {
    key: 'hard',
    label: '困难',
    rows: 12,
    cols: 12,
    mines: 30,
  },
}

export const DEFAULT_DIFFICULTY = DIFFICULTIES.easy

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
