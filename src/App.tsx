import { useEffect, useState } from 'react'
import { Board } from './components/Board'
import { GameHeader } from './components/GameHeader'
import { LeaderboardDialog } from './components/LeaderboardDialog'
import { SettingsDialog } from './components/SettingsDialog'
import { SkillCard } from './components/SkillCard'
import { WinDialog } from './components/WinDialog'
import { DIFFICULTIES } from './game/constants'
import { createEmptyBoard, placeMines } from './game/board'
import {
  addLeaderboardEntry,
  getLeaderboard,
  type LeaderboardEntry,
} from './game/leaderboard'
import { revealAllMines, revealCells, toggleFlag } from './game/reveal'
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  type Settings,
} from './game/settings'
import { detectMinesInArea } from './game/skills'
import type { ArmedSkill, Board as BoardModel, GameStatus } from './game/types'
import { getRemainingMines, hasWon } from './game/victory'

type Dialog = 'none' | 'win' | 'leaderboard' | 'settings'

function createNewGame(settings: Settings): BoardModel {
  return createEmptyBoard(DIFFICULTIES[settings.difficulty])
}

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  const [board, setBoard] = useState<BoardModel>(() => createNewGame(DEFAULT_SETTINGS))
  const [status, setStatus] = useState<GameStatus>('ready')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [skillUsesLeft, setSkillUsesLeft] = useState(DEFAULT_SETTINGS.skillUsesPerGame)
  const [armedSkill, setArmedSkill] = useState<ArmedSkill>(null)

  const [dialog, setDialog] = useState<Dialog>('none')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)
  const [hasSavedCurrentWin, setHasSavedCurrentWin] = useState(false)

  const difficulty = settings.difficulty

  // 读取服务端保存的设置；加载完成前棋盘不接受操作，避免刚开局就被重置。
  useEffect(() => {
    let isActive = true

    getSettings()
      .then((storedSettings) => {
        if (!isActive) {
          return
        }
        setSettings(storedSettings)
        setBoard(createNewGame(storedSettings))
        setSkillUsesLeft(storedSettings.skillUsesPerGame)
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return
        }
        setSettingsError(
          error instanceof Error ? error.message : '设置读取失败，已使用默认设置。',
        )
      })
      .finally(() => {
        if (isActive) {
          setSettingsLoaded(true)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (status !== 'playing') {
      return undefined
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [status])

  const startNewGame = (nextSettings: Settings) => {
    setBoard(createNewGame(nextSettings))
    setStatus('ready')
    setElapsedSeconds(0)
    setSkillUsesLeft(nextSettings.skillUsesPerGame)
    setArmedSkill(null)
    setDialog('none')
    setHasSavedCurrentWin(false)
  }

  const handleRestart = () => {
    startNewGame(settings)
  }

  const handleSettingsChange = (nextSettings: Settings) => {
    if (
      nextSettings.difficulty === settings.difficulty &&
      nextSettings.skillUsesPerGame === settings.skillUsesPerGame
    ) {
      return
    }

    setSettings(nextSettings)
    startNewGame(nextSettings)
    setSettingsSaving(true)
    setSettingsError(null)

    saveSettings(nextSettings)
      .catch((error: unknown) => {
        setSettingsError(
          error instanceof Error ? error.message : '设置保存失败。',
        )
      })
      .finally(() => {
        setSettingsSaving(false)
      })
  }

  const handleSkillCardClick = () => {
    if (!settingsLoaded || status !== 'playing' || skillUsesLeft <= 0) {
      return
    }

    setArmedSkill((current) => (current ? null : 'detect-mines'))
  }

  const handleCellClick = (row: number, col: number) => {
    if (!settingsLoaded || status === 'won' || status === 'lost') {
      return
    }

    // 技能待命时，本次点击用于探测，不翻开格子。
    if (armedSkill === 'detect-mines') {
      if (status !== 'playing') {
        return
      }

      setBoard(detectMinesInArea(board, row, col))
      setSkillUsesLeft((current) => Math.max(0, current - 1))
      setArmedSkill(null)
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
      setArmedSkill(null)
      return
    }

    const nextBoard = revealCells(boardToReveal, row, col)
    const won = hasWon(nextBoard)
    setBoard(nextBoard)
    setStatus(won ? 'won' : 'playing')

    if (won) {
      setArmedSkill(null)
      setDialog('win')
    }
  }

  const handleToggleFlag = (row: number, col: number) => {
    if (!settingsLoaded || status === 'won' || status === 'lost') {
      return
    }

    // 右键正常插旗，技能保持待命。
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
          onShowSettings={() => setDialog('settings')}
        />

        {settingsError && <p className="notice">{settingsError}</p>}

        <Board
          board={board}
          status={status}
          armed={armedSkill !== null}
          locked={!settingsLoaded}
          onReveal={handleCellClick}
          onToggleFlag={handleToggleFlag}
        />

        <SkillCard
          usesLeft={skillUsesLeft}
          usesTotal={settings.skillUsesPerGame}
          armed={armedSkill === 'detect-mines'}
          status={status}
          onUse={handleSkillCardClick}
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
      {dialog === 'settings' && (
        <SettingsDialog
          settings={settings}
          saving={settingsSaving}
          error={settingsError}
          onChange={handleSettingsChange}
          onClose={() => setDialog('none')}
        />
      )}
    </main>
  )
}

export default App
