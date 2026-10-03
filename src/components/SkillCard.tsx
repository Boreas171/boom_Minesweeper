import type { GameStatus } from '../game/types'

type SkillCardProps = {
  usesLeft: number
  usesTotal: number
  armed: boolean
  status: GameStatus
  onUse: () => void
}

export function SkillCard({
  usesLeft,
  usesTotal,
  armed,
  status,
  onUse,
}: SkillCardProps) {
  const isPlayable = status === 'playing' && usesLeft > 0
  const className = [
    'skill-card',
    armed ? 'skill-card--armed' : '',
    isPlayable ? '' : 'skill-card--disabled',
  ]
    .filter(Boolean)
    .join(' ')

  const getHint = () => {
    if (status === 'ready') {
      return '首次翻开格子后可用'
    }
    if (status === 'won' || status === 'lost') {
      return '本局已结束'
    }
    if (usesLeft <= 0) {
      return '本局次数已用完'
    }
    if (armed) {
      return '请点击棋盘上的格子'
    }
    return '点击后，再点棋盘即可探明以该格为中心的 3x3 范围'
  }

  return (
    <div className="skill-area">
      <button
        className={className}
        type="button"
        onClick={onUse}
        disabled={!isPlayable}
        aria-pressed={armed}
        aria-label={`范围探测技能卡，剩余 ${usesLeft} 次，共 ${usesTotal} 次`}
      >
        <span className="skill-icon" aria-hidden="true">◎</span>
        <span className="skill-text">
          <span className="skill-name">范围探测</span>
          <span className="skill-desc">探明 3 x 3 区域内的地雷</span>
        </span>
        <span className="skill-uses">
          {usesLeft} / {usesTotal}
        </span>
      </button>
      <p className="skill-hint">{getHint()}</p>
    </div>
  )
}
