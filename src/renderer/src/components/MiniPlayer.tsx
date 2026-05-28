import { useState } from 'react'
import SportTabs from './SportTabs'
import { SPORTS, type SportKey } from '../types/sport'
import type { NormalizedGame } from '../types/game'
import './MiniPlayer.css'

interface MiniPlayerProps {
  activeSport:    SportKey
  onSportChange:  (sport: SportKey) => void
  games:          NormalizedGame[]
  loading:        boolean
  error:          string | null
  lastUpdated:    Date | null
  onRefresh:      () => void
}

export default function MiniPlayer(props: MiniPlayerProps): JSX.Element {
  const { activeSport, onSportChange, games, loading, error, lastUpdated, onRefresh } = props
  const [isPinned, setIsPinned] = useState(true)

  const sportConfig = SPORTS.find(s => s.key === activeSport)

  function togglePin() {
    const next = !isPinned
    setIsPinned(next)
    window.windowAPI?.setAlwaysOnTop(next)
  }

  return (
    <div className="miniplayer">

      {/* ── TITLE BAR ────────────────────────────────────────────────────
          -webkit-app-region: drag  →  lets the user drag the window
          The controls get no-drag so button clicks still register      */}
      <div className="titlebar" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="titlebar-left">
          <span className="app-icon">🏆</span>
          <span className="app-title">MiniScore</span>
          {/* Pulsing dot while data is refreshing */}
          {loading && <span className="dot pulsing" />}
        </div>

        <div className="titlebar-right" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            className={`ctrl ${isPinned ? 'pinned' : ''}`}
            onClick={togglePin}
            title={isPinned ? 'Pinned — click to unpin' : 'Click to pin on top'}
          >📌</button>

          <button className="ctrl" onClick={onRefresh} disabled={loading} title="Refresh">
            🔄
          </button>

          <button className="ctrl" onClick={() => window.windowAPI?.minimize()} title="Minimize">
            ─
          </button>

          <button className="ctrl close" onClick={() => window.windowAPI?.close()} title="Close">
            ✕
          </button>
        </div>
      </div>

      {/* ── SPORT TABS ───────────────────────────────────────────────── */}
      <SportTabs activeSport={activeSport} onSportChange={onSportChange} />

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <div className="content">
        {!sportConfig?.enabled ? (
          // Sport not yet implemented
          <div className="state">
            <span className="state-icon">🚧</span>
            <p className="state-title">{activeSport} — Coming Soon</p>
            <p className="state-sub">This sport is on the roadmap</p>
          </div>

        ) : loading && games.length === 0 ? (
          // First load — nothing to show yet
          <div className="state">
            <span className="state-icon spin">⟳</span>
            <p className="state-title">Loading {activeSport} games...</p>
          </div>

        ) : error ? (
          // Something went wrong
          <div className="state error">
            <span className="state-icon">⚠️</span>
            <p className="state-title">Something went wrong</p>
            <p className="state-sub">{error}</p>
            <button className="retry" onClick={onRefresh}>Try again</button>
          </div>

        ) : games.length === 0 ? (
          // No games right now
          <div className="state">
            <span className="state-icon">😴</span>
            <p className="state-title">No live {activeSport} games</p>
            <p className="state-sub">Check back later for upcoming games</p>
          </div>

        ) : (
          // Games list — GameCard component replaces the placeholder in Step 8
          <div className="games-list">
            {games.map(game => (
              <div key={game.id} className="game-placeholder">
                {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
                <span className="game-time">{game.gameTime}</span>
                {game.seriesStatus && (
                  <span className="series">{game.seriesStatus}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      {lastUpdated && (
        <div className="footer">
          <span className="dot" />
          Updated {lastUpdated.toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })}
        </div>
      )}
    </div>
  )
}