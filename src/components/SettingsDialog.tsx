import { DIFFICULTIES } from '../game/constants'
import {
  MAX_SKILL_USES,
  MIN_SKILL_USES,
  clampSkillUses,
  type Settings,
} from '../game/settings'
import type { DifficultyKey } from '../game/types'

type SettingsDialogProps = {
  settings: Settings
  saving: boolean
  error: string | null
  onChange: (next: Settings) => void
  onClose: () => void
}

export function SettingsDialog({
  settings,
  saving,
  error,
  onChange,
  onClose,
}: SettingsDialogProps) {
  const handleDifficulty = (difficulty: DifficultyKey) => {
    if (difficulty === settings.difficulty) {
      return
    }
    onChange({ ...settings, difficulty })
  }

  const handleSkillUses = (delta: number) => {
    const nextValue = clampSkillUses(settings.skillUsesPerGame + delta)
    if (nextValue === settings.skillUsesPerGame) {
      return
    }
    onChange({ ...settings, skillUsesPerGame: nextValue })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">GAME SETTINGS</span>
            <h2 id="settings-title">设置</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="关闭设置">
            ×
          </button>
        </div>

        <div className="setting-group">
          <span className="setting-label">难度</span>
          <div className="difficulty-options">
            {Object.values(DIFFICULTIES).map((option) => (
              <button
                key={option.key}
                className={`difficulty-option ${
                  option.key === settings.difficulty ? 'difficulty-option--active' : ''
                }`}
                type="button"
                onClick={() => handleDifficulty(option.key)}
              >
                <strong>{option.label}</strong>
                <span>
                  {option.rows} x {option.cols} / {option.mines} 雷
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <span className="setting-label">技能卡每局可用次数</span>
          <div className="stepper">
            <button
              className="stepper-button"
              type="button"
              onClick={() => handleSkillUses(-1)}
              disabled={settings.skillUsesPerGame <= MIN_SKILL_USES}
              aria-label="减少技能卡次数"
            >
              −
            </button>
            <strong className="stepper-value">{settings.skillUsesPerGame}</strong>
            <button
              className="stepper-button"
              type="button"
              onClick={() => handleSkillUses(1)}
              disabled={settings.skillUsesPerGame >= MAX_SKILL_USES}
              aria-label="增加技能卡次数"
            >
              ＋
            </button>
          </div>
          <p className="setting-note">
            取值 {MIN_SKILL_USES}–{MAX_SKILL_USES}，与难度无关；设为 0 表示本局不使用技能卡。
          </p>
        </div>

        <p className="setting-alert">修改后本局会立即重新开始。</p>
        {error && <p className="setting-error">{error}</p>}

        <div className="modal-actions modal-actions--end">
          <button
            className="button button--secondary"
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            {saving ? '保存中…' : '关闭'}
          </button>
        </div>
      </section>
    </div>
  )
}
