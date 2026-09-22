import { NEIGHBOR_OFFSETS } from './constants'
import type { Board, Cell, Difficulty } from './types'

export function createEmptyBoard({ rows, cols }: Difficulty): Board {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col): Cell => ({
      row,
      col,
      hasMine: false,
      adjacentMines: 0,
      revealed: false,
      flagged: false,
    })),
  )
}

export function getNeighbors(board: Board, row: number, col: number): Cell[] {
  return NEIGHBOR_OFFSETS.flatMap(([rowOffset, colOffset]) => {
    const neighborRow = row + rowOffset
    const neighborCol = col + colOffset
    const neighbor = board[neighborRow]?.[neighborCol]
    return neighbor ? [neighbor] : []
  })
}

export function placeMines(
  board: Board,
  difficulty: Difficulty,
  safeRow: number,
  safeCol: number,
): Board {
  const candidates: Array<[number, number]> = []

  for (let row = 0; row < difficulty.rows; row += 1) {
    for (let col = 0; col < difficulty.cols; col += 1) {
      if (row !== safeRow || col !== safeCol) {
        candidates.push([row, col])
      }
    }
  }

  if (difficulty.mines > candidates.length) {
    throw new Error('雷数不能超过首点之外的格子数量')
  }

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[candidates[index], candidates[swapIndex]] = [
      candidates[swapIndex],
      candidates[index],
    ]
  }

  const mines = new Set(
    candidates
      .slice(0, difficulty.mines)
      .map(([row, col]) => `${row}:${col}`),
  )

  const boardWithMines = board.map((boardRow) =>
    boardRow.map((cell) => ({
      ...cell,
      hasMine: mines.has(`${cell.row}:${cell.col}`),
      adjacentMines: 0,
    })),
  )

  return calculateAdjacentMines(boardWithMines)
}

export function calculateAdjacentMines(board: Board): Board {
  return board.map((boardRow) =>
    boardRow.map((cell) => ({
      ...cell,
      adjacentMines: cell.hasMine
        ? 0
        : getNeighbors(board, cell.row, cell.col).filter(
            (neighbor) => neighbor.hasMine,
          ).length,
    })),
  )
}
