import type { DifficultyKey } from './types'

export type LeaderboardEntry = {
  id: string
  elapsedSeconds: number
  difficulty: DifficultyKey
  completedAt: string
}

export function formatElapsedTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error('排行榜服务暂时不可用。')
  }

  return response.json() as Promise<T>
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch('/api/leaderboard')
  return readResponse<LeaderboardEntry[]>(response)
}

export async function addLeaderboardEntry(
  elapsedSeconds: number,
  difficulty: DifficultyKey,
): Promise<LeaderboardEntry> {
  const response = await fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ elapsedSeconds, difficulty }),
  })

  return readResponse<LeaderboardEntry>(response)
}
