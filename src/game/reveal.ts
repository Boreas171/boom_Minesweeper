import { getNeighbors } from './board'
import type { Board } from './types'

export function revealCells(board: Board, row: number, col: number): Board {
  const selectedCell = board[row]?.[col]
  if (!selectedCell || selectedCell.revealed || selectedCell.flagged) {
    return board
  }

  const nextBoard = board.map((boardRow) =>
    boardRow.map((cell) => ({ ...cell })),
  )

  if (selectedCell.hasMine) {
    nextBoard[row][col].revealed = true
    return nextBoard
  }

  const queue: Array<[number, number]> = [[row, col]]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift()!
    const key = `${currentRow}:${currentCol}`

    if (visited.has(key)) {
      continue
    }
    visited.add(key)

    const cell = nextBoard[currentRow]?.[currentCol]
    if (!cell || cell.revealed || cell.flagged || cell.hasMine) {
      continue
    }

    cell.revealed = true

    if (cell.adjacentMines === 0) {
      getNeighbors(nextBoard, currentRow, currentCol).forEach((neighbor) => {
        queue.push([neighbor.row, neighbor.col])
      })
    }
  }

  return nextBoard
}

export function revealAllMines(board: Board): Board {
  return board.map((boardRow) =>
    boardRow.map((cell) =>
      cell.hasMine ? { ...cell, revealed: true } : { ...cell },
    ),
  )
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const selectedCell = board[row]?.[col]
  if (!selectedCell || selectedCell.revealed) {
    return board
  }

  return board.map((boardRow) =>
    boardRow.map((cell) =>
      cell.row === row && cell.col === col
        ? { ...cell, flagged: !cell.flagged }
        : { ...cell },
    ),
  )
}
