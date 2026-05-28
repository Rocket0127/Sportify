import type { NormalizedGame } from '../types/game'
import type { SportKey } from '../types/sport'

const mockNBAGames: NormalizedGame[] = [
  {
    id: 'nba-mock-1',
    sport: 'NBA',
    status: 'live',
    homeTeam: {
      id: 'OKC', name: 'Oklahoma City Thunder', abbreviation: 'OKC',
      logoUrl: 'https://cdn.nba.com/logos/nba/1610612760/global/L/logo.svg',
      score: 88,
    },
    awayTeam: {
      id: 'MIN', name: 'Minnesota Timberwolves', abbreviation: 'MIN',
      logoUrl: 'https://cdn.nba.com/logos/nba/1610612750/global/L/logo.svg',
      score: 82,
    },
    gameTime: 'Q3 4:32',
    isPlayoff: true,
    seriesStatus: 'OKC leads 3-2',
    sportSpecific: {
      sport: 'NBA',
      quarter: 3,
      timeRemaining: '4:32',
      homeBonus: true,
      awayBonus: false,
      topScorer: {
        home: { name: 'Shai Gilgeous-Alexander', statLine: '28 PTS, 6 AST, 3 REB', score: 52 },
        away: { name: 'Anthony Edwards',         statLine: '24 PTS, 5 REB, 4 AST', score: 45 },
      },
    },
  },
  {
    id: 'nba-mock-2',
    sport: 'NBA',
    status: 'live',
    homeTeam: {
      id: 'BOS', name: 'Boston Celtics', abbreviation: 'BOS',
      logoUrl: 'https://cdn.nba.com/logos/nba/1610612738/global/L/logo.svg',
      score: 101,
    },
    awayTeam: {
      id: 'NYK', name: 'New York Knicks', abbreviation: 'NYK',
      logoUrl: 'https://cdn.nba.com/logos/nba/1610612752/global/L/logo.svg',
      score: 99,
    },
    gameTime: 'Q4 1:15',
    isPlayoff: true,
    seriesStatus: 'Series tied 2-2',
    sportSpecific: {
      sport: 'NBA',
      quarter: 4,
      timeRemaining: '1:15',
      homeBonus: true,
      awayBonus: true,
      topScorer: {
        home: { name: 'Jayson Tatum',  statLine: '32 PTS, 9 REB, 5 AST', score: 64 },
        away: { name: 'Jalen Brunson', statLine: '29 PTS, 7 AST, 4 REB', score: 57 },
      },
    },
  },
]

const mockMLBGames: NormalizedGame[] = [
  {
    id: 'mlb-mock-1',
    sport: 'MLB',
    status: 'live',
    homeTeam: {
      id: 'NYY', name: 'New York Yankees', abbreviation: 'NYY',
      logoUrl: 'https://www.mlbstatic.com/team-logos/team-cap-on-light/147.svg',
      score: 3,
    },
    awayTeam: {
      id: 'BOS', name: 'Boston Red Sox', abbreviation: 'BOS',
      logoUrl: 'https://www.mlbstatic.com/team-logos/team-cap-on-light/111.svg',
      score: 2,
    },
    gameTime: 'Top 7th, 1 out',
    isPlayoff: false,
    sportSpecific: {
      sport: 'MLB',
      inning: 7,
      isTopInning: true,
      outs: 1,
      currentBatter: 'Rafael Devers',
      currentPitcher: 'Gerrit Cole',
      topBatter:  { name: 'Aaron Judge',  statLine: '2/3, 1 HR, 2 RBI', score: 12 },
      topPitcher: { name: 'Gerrit Cole',  statLine: '6.1 IP, 7 K, 1 ER', score: 22 },
    },
  },
]

/**
 * Returns mock game data for a given sport.
 * Simulates a ~400ms network delay so loading states actually show.
 */
export async function getMockGames(sport: SportKey): Promise<NormalizedGame[]> {
  await new Promise(r => setTimeout(r, 400))
  switch (sport) {
    case 'NBA': return mockNBAGames
    case 'MLB': return mockMLBGames
    default:    return []
  }
}