import React from 'react'
import type { NormalizedGame, NBAGameData } from '../types/game'
import './GameDetail.css'

interface GameDetailProps {
  game: NormalizedGame
  onBack: () => void
}

/**
 * Concept A — "Versus" layout.
 * Two logos face off, scores beneath, top scorers below.
 * Currently NBA-specific; later sports plug in by switching on game.sport.
 */
export default function GameDetail({ game, onBack }: GameDetailProps): React.ReactElement {
  // For now we focus on NBA. MLB/NHL/NFL get their own detail components later.
  const nba = game.sport === 'NBA' ? (game.sportSpecific as NBAGameData) : null

  // Determine which side is winning — used to color the larger score
  const homeWinning = game.homeTeam.score > game.awayTeam.score
  const awayWinning = game.awayTeam.score > game.homeTeam.score

  return (
    <div className="game-detail">
      {/* ── TOP STRIP: back button, live clock, series ─────────── */}
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <div className="live-clock">
          <span className="live-dot" />
          <span>{game.gameTime}</span>
        </div>

        {game.seriesStatus ? (
          <span className="series-tag">{game.seriesStatus}</span>
        ) : (
          <span /> /* empty placeholder keeps spacing symmetric */
        )}
      </div>

      {/* ── VERSUS: away logo · VS · home logo ─────────────────── */}
      <div className="versus">
        {/* AWAY (left) */}
        <div className="team-block">
          <img
            src={game.awayTeam.logoUrl}
            alt={game.awayTeam.abbreviation}
            className="team-logo-large"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="team-abbr">{game.awayTeam.abbreviation}</div>
          <div className="team-fullname">{game.awayTeam.name}</div>
          {nba?.awayBonus && <span className="bonus-tag">BONUS</span>}
          <div className={'team-score-big ' + (awayWinning ? 'winning' : '')}>
            {game.awayTeam.score}
          </div>
        </div>

        {/* VS divider */}
        <div className="vs-divider">VS</div>

        {/* HOME (right) */}
        <div className="team-block">
          <img
            src={game.homeTeam.logoUrl}
            alt={game.homeTeam.abbreviation}
            className="team-logo-large"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="team-abbr">{game.homeTeam.abbreviation}</div>
          <div className="team-fullname">{game.homeTeam.name}</div>
          {nba?.homeBonus && <span className="bonus-tag">BONUS</span>}
          <div className={'team-score-big ' + (homeWinning ? 'winning' : '')}>
            {game.homeTeam.score}
          </div>
        </div>
      </div>

      {/* ── TOP SCORERS (NBA only for now) ─────────────────────── */}
      {nba && (nba.topScorer.away || nba.topScorer.home) && (
        <div className="top-scorers">
          <div className="scorer-block left">
            <div className="scorer-label">★ TOP SCORER</div>
            {nba.topScorer.away ? (
              <>
                <div className="scorer-name">{nba.topScorer.away.name}</div>
                <div className="scorer-stats">{nba.topScorer.away.statLine}</div>
              </>
            ) : (
              <div className="scorer-empty">No data</div>
            )}
          </div>

          <div className="scorer-block right">
            <div className="scorer-label">★ TOP SCORER</div>
            {nba.topScorer.home ? (
              <>
                <div className="scorer-name">{nba.topScorer.home.name}</div>
                <div className="scorer-stats">{nba.topScorer.home.statLine}</div>
              </>
            ) : (
              <div className="scorer-empty">No data</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}