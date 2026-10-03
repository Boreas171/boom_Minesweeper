import { DIFFICULTIES } from '../game/constants'
import { formatElapsedTime } from '../game/leaderboard'
import type { DifficultyKey, GameStatus } from '../game/types'

const STATUS_LABELS: Record<GameStatus, string> = {
  ready: '准备开始',
  playing: '进行中',
  won: '成功完成',
  lost: '踩到地雷',
}

type GameHeaderProps = {
  difficulty: DifficultyKey
  remainingMines: number
  totalMines: number
  elapsedSeconds: number
  status: GameStatus
  onRestart: () => void
  onShowLeaderboard: () => void
  onShowSettings: () => void
}

export function GameHeader({
  difficulty,
  remainingMines,
  totalMines,
  elapsedSeconds,
  status,
  onRestart,
  onShowLeaderboard,
  onShowSettings,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="brand-lockup">
        <span className="brand-kicker">
          MINESWEEPER / {DIFFICULTIES[difficulty].label}
        </span>
        <h1>扫雷</h1>
      </div>

      <div className="status-strip" aria-live="polite">
        <div className="stat">
          <span className="stat-label">剩余雷数 / 总数</span>
          <strong className="stat-value">
            {String(remainingMines).padStart(2, '0')} / {totalMines}
          </strong>
        </div>
        <div className="stat">
          <span className="stat-label">用时</span>
          <strong className="stat-value">{formatElapsedTime(elapsedSeconds)}</strong>
        </div>
        <div className={`stat stat--${status}`}>
          <span className="stat-label">状态</span>
          <strong className="stat-value stat-value--text">{STATUS_LABELS[status]}</strong>
        </div>
      </div>

      <div className="header-actions">
        <button className="header-button" type="button" onClick={onShowSettings}>
          设置
        </button>
        <button className="header-button" type="button" onClick={onShowLeaderboard}>
          查看排行榜
        </button>
        <button className="restart-button" type="button" onClick={onRestart}>
          <span className="restart-icon" aria-hidden="true">↻</span>
          重新开始
        </button>
      </div>
    </header>
  )
}
