import type { Board as BoardModel, GameStatus } from '../game/types'
import { Cell } from './Cell'

type BoardProps = {
  board: BoardModel
  status: GameStatus
  onReveal: (row: number, col: number) => void
  onToggleFlag: (row: number, col: number) => void
}

export function Board({ board, status, onReveal, onToggleFlag }: BoardProps) {
  const columns = board[0]?.length ?? 0

  return (
    <section className={`board-area board-area--${status}`} aria-label="扫雷棋盘">
      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${columns}, var(--cell-size))` }}
      >
        {board.flatMap((row) =>
          row.map((cell) => (
            <Cell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              onReveal={onReveal}
              onToggleFlag={onToggleFlag}
            />
          )),
        )}
      </div>
    </section>
  )
}
