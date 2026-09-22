export type GameStatus = 'ready' | 'playing' | 'won' | 'lost'

export type Difficulty = {
  rows: number
  cols: number
  mines: number
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
