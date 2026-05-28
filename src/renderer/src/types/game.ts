import type { SportKey } from './sport'

export type GameStatus = 'live' | 'upcoming' | 'final'

export interface TeamInfo {
  id: string
  name: string          // "Oklahoma City Thunder"
  abbreviation: string  // "OKC"
  logoUrl: string       // URL to the team logo
  score: number
}

export interface PlayerStatSummary {
  name: string
  /** Human-readable line: "28 PTS, 6 AST, 3 REB" | "3/4, 1 HR, 2 RBI" */
  statLine: string
  /** Internal number used to rank who is "top" player — not shown in UI */
  score: number
}

// ── Sport-specific data blocks ──────────────────────────────────────────────

export interface NBAGameData {
  sport: 'NBA'
  quarter: number       // 1–4, or 5+ for overtime
  timeRemaining: string // "4:32"
  homeBonus: boolean    // Team has committed 4+ fouls this period
  awayBonus: boolean
  topScorer: {
    home: PlayerStatSummary | null
    away: PlayerStatSummary | null
  }
}

export interface MLBGameData {
  sport: 'MLB'
  inning: number         // 1–9+
  isTopInning: boolean   // true = away team batting
  outs: number           // 0, 1, or 2
  currentBatter: string  // Player name
  currentPitcher: string // Player name
  topBatter: PlayerStatSummary | null
  topPitcher: PlayerStatSummary | null
}

// Placeholders — will be expanded when NHL/NFL are implemented
export interface NHLGameData { sport: 'NHL' }
export interface NFLGameData { sport: 'NFL' }

export type SportSpecificData = NBAGameData | MLBGameData | NHLGameData | NFLGameData

// ── The single shared format all sports produce ─────────────────────────────

export interface NormalizedGame {
  id: string
  sport: SportKey
  status: GameStatus
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  /** Display string: "Q3 4:32" | "Bot 7th, 1 out" | "7:30 PM ET" */
  gameTime: string
  isPlayoff: boolean
  /** "OKC leads 3-2" | "Series tied 2-2" — only set for playoff games */
  seriesStatus?: string
  sportSpecific: SportSpecificData
}