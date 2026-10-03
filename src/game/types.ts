export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export type DifficultyKey = 'easy' | 'normal' | 'hard'

export type Difficulty = {
  rows: number
  cols: number
  mines: number
}

export type DifficultyOption = Difficulty & {
  key: DifficultyKey
  label: string
}

export type Cell = {
  row: number
  col: number
  hasMine: boolean
  adjacentMines: number
  revealed: boolean
  flagged: boolean
  /** 被技能探明的地雷，独立于 revealed，不影响踩雷判定 */
  detected: boolean
}

export type Board = Cell[][]

export type SkillKey = 'detect-mines'

export type ArmedSkill = SkillKey | null
