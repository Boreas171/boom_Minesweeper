import type { Board } from './types'

export function countFlags(board: Board): number {
  return board.reduce(
    (total, row) => total + row.filter((cell) => cell.flagged).length,
    0,
  )
}

export function getRemainingMines(board: Board, totalMines: number): number {
  return totalMines - countFlags(board)
}

export function hasWon(board: Board): boolean {
  return board.every((row) =>
    row.every((cell) => cell.hasMine || cell.revealed),
  )
}
