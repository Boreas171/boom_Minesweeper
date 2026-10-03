import type { Board as BoardModel, GameStatus } from '../game/types'
import { Cell } from './Cell'

type BoardProps = {
  board: BoardModel
  status: GameStatus
  armed: boolean
  locked: boolean
  onReveal: (row: number, col: number) => void
  onToggleFlag: (row: number, col: number) => void
}

export function Board({
  board,
  status,
  armed,
  locked,
  onReveal,
  onToggleFlag,
}: BoardProps) {
  const columns = board[0]?.length ?? 0
  const classNames = [
    'board-area',
    `board-area--${status}`,
    armed ? 'board-area--armed' : '',
    locked ? 'board-area--locked' : '',
  ]

  return (
    <section
      className={classNames.filter(Boolean).join(' ')}
      aria-label="扫雷棋盘"
      aria-busy={locked}
    >
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
