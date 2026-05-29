import type { NormalizedGame } from '../types/game'

const API_KEY  = import.meta.env.VITE_BALLDONTLIE_API_KEY
const BASE_URL = 'https://api.balldontlie.io/v1'

// ── In-memory cache to avoid hammering the API ──────────────────
// BallDontLie allows 5 requests/min on free tier. We cache for 25s so even
// the auto-refresh (every 20s) usually serves from cache, not the network.
const CACHE_MS = 30_000
let cachedAt = 0
let cachedGames: NormalizedGame[] | null = null

// ── Raw API response types (only the fields we use) ─────────────
interface BDLTeam {
  id: number
  abbreviation: string
  full_name: string
  city: string
  name: string
}

interface BDLGame {
  id: number
  date: string             // ISO timestamp
  status: string           // "Final", "1st Qtr", "1:23 - 4th Qtr", "7:30 PM ET", etc.
  period: number           // 1-4 (or 5+ for OT)
  time: string | null      // "4:32" during play, null between periods
  home_team: BDLTeam
  visitor_team: BDLTeam
  home_team_score: number
  visitor_team_score: number
  postseason: boolean
}

// ── Helpers ─────────────────────────────────────────────────────

/** Map NBA team abbreviation → NBA franchise ID (used by the official logo CDN) */
const NBA_FRANCHISE_IDS: Record<string, number> = {
  ATL: 1610612737, BOS: 1610612738, BKN: 1610612751, CHA: 1610612766,
  CHI: 1610612741, CLE: 1610612739, DAL: 1610612742, DEN: 1610612743,
  DET: 1610612765, GSW: 1610612744, HOU: 1610612745, IND: 1610612754,
  LAC: 1610612746, LAL: 1610612747, MEM: 1610612763, MIA: 1610612748,
  MIL: 1610612749, MIN: 1610612750, NOP: 1610612740, NYK: 1610612752,
  OKC: 1610612760, ORL: 1610612753, PHI: 1610612755, PHX: 1610612756,
  POR: 1610612757, SAC: 1610612758, SAS: 1610612759, TOR: 1610612761,
  UTA: 1610612762, WAS: 1610612764,
}

/** Build the team logo URL from the team's abbreviation */
function logoUrl(abbreviation: string): string {
  const id = NBA_FRANCHISE_IDS[abbreviation]
  return id
    ? `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`
    : ''
}

/** Decide whether a game is live, upcoming, or final based on its status string */
function classifyStatus(status: string): 'live' | 'upcoming' | 'final' {
  const lower = status.toLowerCase()
  if (lower.includes('final')) return 'final'
  if (lower.includes('qtr') || lower.includes('halftime') || lower.includes('ot')) return 'live'
  return 'upcoming' // "7:30 PM ET" etc.
}

function formatGameTime(g: BDLGame): string {
  const cls = classifyStatus(g.status)
  if (cls === 'final')    return 'Final'
  if (cls === 'live') {
    if (g.time) return `Q${g.period} ${g.time}`
    return g.status   // "Halftime", "End Q3", etc.
  }
  // Upcoming — turn ISO date into local game time like "7:30 PM"
  const d = new Date(g.status.includes('T') ? g.status : g.date)
  if (!isNaN(d.getTime())) {
   return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  return g.status
}
/** Today's date as 'YYYY-MM-DD' in Eastern Time (NBA games are scheduled in ET) */
/** Get today's date in ET as 'YYYY-MM-DD' — handles timezones properly */
function todayET(): string {
  // toLocaleString with sv-SE (Swedish) gives ISO-formatted date strings
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/New_York',
  }).slice(0, 10)
}

// ── Main exported function ──────────────────────────────────────

/**
 * Fetch NBA games for today, normalize them into our shared format.
 * - Returns live games first; if none live, returns upcoming/final for today.
 * - Throws if the API request fails (App.tsx catches it and shows error state).
 */
export async function fetchNBAGames(): Promise<NormalizedGame[]> {
  if (!API_KEY) throw new Error('Missing VITE_BALLDONTLIE_API_KEY in .env')

  // Serve from cache if fresh
  const now = Date.now()
  if (cachedGames && now - cachedAt < CACHE_MS) {
    return cachedGames
  }

  // Query yesterday + today + tomorrow in ET to catch any timezone edge cases
  const date      = todayET()
  const dateMs    = new Date(date + 'T12:00:00Z').getTime()
  const yesterday = new Date(dateMs - 86_400_000).toISOString().slice(0, 10)
  const tomorrow  = new Date(dateMs + 86_400_000).toISOString().slice(0, 10)
  const url       = `${BASE_URL}/games?dates[]=${yesterday}&dates[]=${date}&dates[]=${tomorrow}&per_page=50`


  const res = await fetch(url, {
    headers: { Authorization: API_KEY },
  })

 if (res.status === 429) {
  // Rate limited — keep returning whatever we last had (even empty) and don't error
  console.warn('🏀 Rate limited — using cached data')
  if (cachedGames) return cachedGames
  // Cache an empty array briefly so we stop hammering the API
  cachedAt = now
  cachedGames = []
  return []
}

  if (!res.ok) {
    throw new Error(`BallDontLie API error: ${res.status} ${res.statusText}`)
  }

  const json = await res.json() as { data: BDLGame[] }
  const all  = json.data.map(normalizeGame)

  // Prioritize live games; fall back to upcoming, then final
  const live     = all.filter(g => g.status === 'live')
  const upcoming = all.filter(g => g.status === 'upcoming')
  const final    = all.filter(g => g.status === 'final')

  const result = live.length > 0 ? live : upcoming.length > 0 ? upcoming : final

  // Update cache
  cachedAt     = now
  cachedGames  = result
  return result
}
/** Convert one raw API game into our shared NormalizedGame format */
function normalizeGame(g: BDLGame): NormalizedGame {
  return {
    id:     `nba-${g.id}`,
    sport:  'NBA',
    status: classifyStatus(g.status),
    homeTeam: {
      id:           String(g.home_team.id),
      name:         g.home_team.full_name,
      abbreviation: g.home_team.abbreviation,
      logoUrl:      logoUrl(g.home_team.abbreviation),
      score:        g.home_team_score,
    },
    awayTeam: {
      id:           String(g.visitor_team.id),
      name:         g.visitor_team.full_name,
      abbreviation: g.visitor_team.abbreviation,
      logoUrl:      logoUrl(g.visitor_team.abbreviation),
      score:        g.visitor_team_score,
    },
    gameTime:    formatGameTime(g),
    isPlayoff:   g.postseason,
    // Series status requires a separate endpoint — we'll add it in a future step
    seriesStatus: undefined,
    sportSpecific: {
      sport: 'NBA',
      quarter:        g.period || 1,
      timeRemaining:  g.time || '',
      // Bonus + top scorers come from a separate stats endpoint we'll add later
      homeBonus:      false,
      awayBonus:      false,
      topScorer: {
        home: null,
        away: null,
      },
    },
  }
}