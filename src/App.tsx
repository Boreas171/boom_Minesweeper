import { useEffect, useState } from 'react'
import { Board } from './components/Board'
import { GameHeader } from './components/GameHeader'
import { LeaderboardDialog } from './components/LeaderboardDialog'
import { WinDialog } from './components/WinDialog'
import { DEFAULT_DIFFICULTY, DIFFICULTIES } from './game/constants'
import { createEmptyBoard, placeMines } from './game/board'
import {
  addLeaderboardEntry,
  getLeaderboard,
  type LeaderboardEntry,
} from './game/leaderboard'
import { revealAllMines, revealCells, toggleFlag } from './game/reveal'
import type { Board as BoardModel, DifficultyKey, GameStatus } from './game/types'
import { getRemainingMines, hasWon } from './game/victory'

type Dialog = 'none' | 'win' | 'leaderboard'

function createNewGame(difficulty: DifficultyKey): BoardModel {
  return createEmptyBoard(DIFFICULTIES[difficulty])
}

function App() {
  const [difficulty, setDifficulty] = useState<DifficultyKey>(DEFAULT_DIFFICULTY_KEY)
  const [board, setBoard] = useState<BoardModel>(() => createNewGame(DEFAULT_DIFFICULTY.key))
  const [status, setStatus] = useState<GameStatus>('ready')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [dialog, setDialog] = useState<Dialog>('none')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)
  const [hasSavedCurrentWin, setHasSavedCurrentWin] = useState(false)

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
    setBoard(createNewGame(difficulty))
    setStatus('ready')
    setElapsedSeconds(0)
    setDialog('none')
    setHasSavedCurrentWin(false)
  }

  const handleDifficultyChange = (nextDifficulty: DifficultyKey) => {
    setDifficulty(nextDifficulty)
    setBoard(createNewGame(nextDifficulty))
    setStatus('ready')
    setElapsedSeconds(0)
    setDialog('none')
    setHasSavedCurrentWin(false)
  }

  const handleReveal = (row: number, col: number) => {
    if (status === 'won' || status === 'lost') {
      return
    }

    const selectedCell = board[row]?.[col]
    if (!selectedCell || selectedCell.revealed || selectedCell.flagged) {
      return
    }

    const activeDifficulty = DIFFICULTIES[difficulty]
    let boardToReveal = board
    if (status === 'ready') {
      boardToReveal = placeMines(board, activeDifficulty, row, col)
    }

    if (boardToReveal[row][col].hasMine) {
      setBoard(revealAllMines(boardToReveal))
      setStatus('lost')
      return
    }

    const nextBoard = revealCells(boardToReveal, row, col)
    const won = hasWon(nextBoard)
    setBoard(nextBoard)
    setStatus(won ? 'won' : 'playing')

    if (won) {
      setDialog('win')
    }
  }

  const handleToggleFlag = (row: number, col: number) => {
    if (status === 'won' || status === 'lost') {
      return
    }

    setBoard((currentBoard) => toggleFlag(currentBoard, row, col))
  }

  const handleShowLeaderboard = async () => {
    setDialog('leaderboard')
    setLeaderboardError(null)

    try {
      setLeaderboard(await getLeaderboard())
    } catch (error) {
      setLeaderboard([])
      setLeaderboardError(error instanceof Error ? error.message : '排行榜读取失败。')
    }
  }

  const handleSaveWin = async () => {
    if (hasSavedCurrentWin) {
      return
    }

    try {
      await addLeaderboardEntry(elapsedSeconds, difficulty)
      setLeaderboard(await getLeaderboard())
      setHasSavedCurrentWin(true)
    } catch (error) {
      setLeaderboardError(error instanceof Error ? error.message : '排行榜保存失败。')
    }
  }

  const activeDifficulty = DIFFICULTIES[difficulty]
  const remainingMines = getRemainingMines(board, activeDifficulty.mines)

  return (
    <main className="game-page">
      <div className="game-frame">
        <GameHeader
          difficulty={difficulty}
          remainingMines={remainingMines}
          totalMines={activeDifficulty.mines}
          elapsedSeconds={elapsedSeconds}
          status={status}
          onRestart={handleRestart}
          onShowLeaderboard={handleShowLeaderboard}
          onDifficultyChange={handleDifficultyChange}
        />

        <Board
          board={board}
          status={status}
          onReveal={handleReveal}
          onToggleFlag={handleToggleFlag}
        />

        <footer className="game-footer">
          <span>{activeDifficulty.label} {activeDifficulty.rows} x {activeDifficulty.cols} 棋盘</span>
          <span>共 {activeDifficulty.mines} 枚地雷</span>
        </footer>
      </div>

      {dialog === 'win' && (
        <WinDialog
          elapsedSeconds={elapsedSeconds}
          hasSaved={hasSavedCurrentWin}
          onRestart={handleRestart}
          onSave={handleSaveWin}
        />
      )}
      {dialog === 'leaderboard' && (
        <LeaderboardDialog
          entries={leaderboard}
          error={leaderboardError}
          onClose={() => setDialog('none')}
        />
      )}
    </main>
  )
}

const DEFAULT_DIFFICULTY_KEY: DifficultyKey = DEFAULT_DIFFICULTY.key

export default App
