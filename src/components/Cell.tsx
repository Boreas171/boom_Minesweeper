import type { MouseEvent } from 'react'
import type { Cell as CellModel } from '../game/types'

type CellProps = {
  cell: CellModel
  onReveal: (row: number, col: number) => void
  onToggleFlag: (row: number, col: number) => void
}

function getCellLabel(cell: CellModel): string {
  const position = `第 ${cell.row + 1} 行，第 ${cell.col + 1} 列`

  if (cell.flagged && !cell.revealed) {
    return `${position}，已标记`
  }
  if (!cell.revealed) {
    return `${position}，未翻开`
  }
  if (cell.hasMine) {
    return `${position}，地雷`
  }
  if (cell.adjacentMines === 0) {
    return `${position}，空白`
  }
  return `${position}，相邻 ${cell.adjacentMines} 个地雷`
}

export function Cell({ cell, onReveal, onToggleFlag }: CellProps) {
  const classNames = [
    'cell',
    cell.revealed ? 'cell--revealed' : 'cell--hidden',
    cell.flagged ? 'cell--flagged' : '',
    cell.revealed && cell.hasMine ? 'cell--mine' : '',
  ]

  const handleContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onToggleFlag(cell.row, cell.col)
  }

  return (
    <button
      className={classNames.filter(Boolean).join(' ')}
      type="button"
      aria-label={getCellLabel(cell)}
      onClick={() => onReveal(cell.row, cell.col)}
      onContextMenu={handleContextMenu}
      data-number={cell.adjacentMines}
    >
      {!cell.revealed && cell.flagged && (
        <span className="cell-symbol cell-symbol--flag" aria-hidden="true">⚑</span>
      )}
      {cell.revealed && cell.hasMine && (
        <span className="cell-symbol cell-symbol--mine" aria-hidden="true">✹</span>
      )}
      {cell.revealed && !cell.hasMine && cell.adjacentMines > 0 && (
        <span aria-hidden="true">{cell.adjacentMines}</span>
      )}
    </button>
  )
}
