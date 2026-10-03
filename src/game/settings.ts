import type { DifficultyKey } from './types'

export type Settings = {
  difficulty: DifficultyKey
  skillUsesPerGame: number
}

export const MIN_SKILL_USES = 0
export const MAX_SKILL_USES = 5

export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'easy',
  skillUsesPerGame: 1,
}

const DIFFICULTY_KEYS: DifficultyKey[] = ['easy', 'normal', 'hard']

export function clampSkillUses(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SETTINGS.skillUsesPerGame
  }

  return Math.min(MAX_SKILL_USES, Math.max(MIN_SKILL_USES, Math.trunc(value)))
}

export function normalizeSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS
  }

  const candidate = value as Partial<Settings>

  return {
    difficulty:
      candidate.difficulty && DIFFICULTY_KEYS.includes(candidate.difficulty)
        ? candidate.difficulty
        : DEFAULT_SETTINGS.difficulty,
    skillUsesPerGame:
      typeof candidate.skillUsesPerGame === 'number'
        ? clampSkillUses(candidate.skillUsesPerGame)
        : DEFAULT_SETTINGS.skillUsesPerGame,
  }
}

async function readResponse(response: Response): Promise<Settings> {
  if (!response.ok) {
    throw new Error('设置服务暂时不可用。')
  }

  return normalizeSettings(await response.json())
}

export async function getSettings(): Promise<Settings> {
  return readResponse(await fetch('/api/settings'))
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })

  return readResponse(response)
}
