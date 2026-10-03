import type { Board } from './types'

/**
 * 探明以 (row, col) 为中心的 3x3 范围内的所有地雷。
 * 只写入 detected 标记，不改变 revealed / flagged，也不影响胜负判定。
 * 窗口在棋盘边缘会自动裁剪（角落 4 格、边线 6 格、内部 9 格）。
 */
export function detectMinesInArea(board: Board, row: number, col: number): Board {
  if (!board[row]?.[col]) {
    return board
  }

  return board.map((boardRow) =>
    boardRow.map((cell) => {
      const insideArea =
        Math.abs(cell.row - row) <= 1 && Math.abs(cell.col - col) <= 1

      if (!insideArea || !cell.hasMine || cell.detected) {
        return cell
      }

      return { ...cell, detected: true }
    }),
  )
}
