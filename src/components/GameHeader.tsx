import type { ChangeEvent } from 'react'
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
  onDifficultyChange: (difficulty: DifficultyKey) => void
}

export function GameHeader({
  difficulty,
  remainingMines,
  totalMines,
  elapsedSeconds,
  status,
  onRestart,
  onShowLeaderboard,
  onDifficultyChange,
}: GameHeaderProps) {
  const handleDifficultyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(event.target.value as DifficultyKey)
  }

  return (
    <header className="game-header">
      <div className="brand-lockup">
        <span className="brand-kicker">MINESWEEPER</span>
        <h1>扫雷</h1>
      </div>

      <div className="status-strip" aria-live="polite">
        <label className="stat difficulty-select">
          <span className="stat-label">难度</span>
          <select value={difficulty} onChange={handleDifficultyChange} aria-label="选择游戏难度">
            {Object.values(DIFFICULTIES).map((option) => (
              <option key={option.key} value={option.key}>
                {option.label} {option.rows} x {option.cols} / {option.mines} 雷
              </option>
            ))}
          </select>
        </label>
        <div className="stat">
          <span className="stat-label">剩余雷数 / 总数</span>
          <strong className="stat-value">{String(remainingMines).padStart(2, '0')} / {totalMines}</strong>
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
