import { useEffect, useState } from 'react'
import { Board } from './components/Board'
import { GameHeader } from './components/GameHeader'
import { DEFAULT_DIFFICULTY } from './game/constants'
import { createEmptyBoard, placeMines } from './game/board'
import { revealAllMines, revealCells, toggleFlag } from './game/reveal'
import type { Board as BoardModel, GameStatus } from './game/types'
import { getRemainingMines, hasWon } from './game/victory'

function createNewGame(): BoardModel {
  return createEmptyBoard(DEFAULT_DIFFICULTY)
}

function App() {
  const [board, setBoard] = useState<BoardModel>(createNewGame)
  const [status, setStatus] = useState<GameStatus>('ready')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (status !== 'playing') {
      return undefined
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [status])

  const handleRestart = () => {
    setBoard(createNewGame())
    setStatus('ready')
    setElapsedSeconds(0)
  }

  const handleReveal = (row: number, col: number) => {
    if (status === 'won' || status === 'lost') {
      return
    }

    const selectedCell = board[row]?.[col]
    if (!selectedCell || selectedCell.revealed || selectedCell.flagged) {
      return
    }

    let boardToReveal = board
    if (status === 'ready') {
      boardToReveal = placeMines(board, DEFAULT_DIFFICULTY, row, col)
    }

    if (boardToReveal[row][col].hasMine) {
      setBoard(revealAllMines(boardToReveal))
      setStatus('lost')
      return
    }

    const nextBoard = revealCells(boardToReveal, row, col)
    setBoard(nextBoard)
    setStatus(hasWon(nextBoard) ? 'won' : 'playing')
  }

  const handleToggleFlag = (row: number, col: number) => {
    if (status === 'won' || status === 'lost') {
      return
    }

    setBoard((currentBoard) => toggleFlag(currentBoard, row, col))
  }

  const remainingMines = getRemainingMines(board, DEFAULT_DIFFICULTY.mines)

  return (
    <main className="game-page">
      <div className="game-frame">
        <GameHeader
          remainingMines={remainingMines}
          totalMines={DEFAULT_DIFFICULTY.mines}
          elapsedSeconds={elapsedSeconds}
          status={status}
          onRestart={handleRestart}
        />

        <Board
          board={board}
          status={status}
          onReveal={handleReveal}
          onToggleFlag={handleToggleFlag}
        />

        <footer className="game-footer">
          <span>9 x 9 棋盘</span>
          <span>共 10 枚地雷</span>
        </footer>
      </div>
    </main>
  )
}

export default App
