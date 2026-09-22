import type { GameStatus } from '../game/types'

const STATUS_LABELS: Record<GameStatus, string> = {
  ready: '准备开始',
  playing: '进行中',
  won: '成功完成',
  lost: '踩到地雷',
}

type GameHeaderProps = {
  remainingMines: number
  totalMines: number
  elapsedSeconds: number
  status: GameStatus
  onRestart: () => void
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function GameHeader({
  remainingMines,
  totalMines,
  elapsedSeconds,
  status,
  onRestart,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="brand-lockup">
        <span className="brand-kicker">MINESWEEPER / 9 x 9</span>
        <h1>扫雷</h1>
      </div>

      <div className="status-strip" aria-live="polite">
        <div className="stat">
          <span className="stat-label">剩余雷数 / 总数</span>
          <strong className="stat-value">{String(remainingMines).padStart(2, '0')} / {totalMines}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">用时</span>
          <strong className="stat-value">{formatTime(elapsedSeconds)}</strong>
        </div>
        <div className={`stat stat--${status}`}>
          <span className="stat-label">状态</span>
          <strong className="stat-value stat-value--text">{STATUS_LABELS[status]}</strong>
        </div>
      </div>

      <button className="restart-button" type="button" onClick={onRestart}>
        <span className="restart-icon" aria-hidden="true">↻</span>
        重新开始
      </button>
    </header>
  )
}
