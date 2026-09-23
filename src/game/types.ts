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
}

export type Board = Cell[][]
