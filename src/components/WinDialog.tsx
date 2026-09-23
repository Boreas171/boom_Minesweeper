import { formatElapsedTime } from '../game/leaderboard'

type WinDialogProps = {
  elapsedSeconds: number
  hasSaved: boolean
  onRestart: () => void
  onSave: () => void
}

export function WinDialog({
  elapsedSeconds,
  hasSaved,
  onRestart,
  onSave,
}: WinDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal win-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="win-dialog-title"
      >
        <span className="modal-kicker">BOARD CLEARED</span>
        <h2 id="win-dialog-title">完成游戏</h2>
        <p className="win-message">所有安全格已经翻开。</p>
        <div className="completion-time">
          <span>本局用时</span>
          <strong>{formatElapsedTime(elapsedSeconds)}</strong>
        </div>
        <div className="modal-actions">
          <button className="button button--primary" type="button" onClick={onRestart}>
            再来一局
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={onSave}
            disabled={hasSaved}
          >
            {hasSaved ? '已加入排行榜' : '加入排行榜'}
          </button>
        </div>
      </section>
    </div>
  )
}
