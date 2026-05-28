import React, { useState } from 'react'
import SportTabs from './SportTabs'
import { SPORTS, type SportKey } from '../types/sport'
import type { NormalizedGame } from '../types/game'
import './MiniPlayer.css'

interface MiniPlayerProps {
  activeSport: SportKey
  onSportChange: (sport: SportKey) => void
  games: NormalizedGame[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  onRefresh: () => void
}

export default function MiniPlayer(props: MiniPlayerProps): React.ReactElement {
  const { activeSport, onSportChange, games, loading, error, lastUpdated, onRefresh } = props
  const [isPinned, setIsPinned] = useState(true)

  const sportConfig = SPORTS.find(s => s.key === activeSport)

  function togglePin() {
    const next = !isPinned
    setIsPinned(next)
    window.windowAPI?.setAlwaysOnTop(next)
  }

  const dragStyle = { WebkitAppRegion: 'drag' } as React.CSSProperties
  const noDragStyle = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

  return (
    <div className="miniplayer">
      <div className="titlebar" style={dragStyle}>
        <div className="titlebar-left">
          <span className="app-title">MiniScore</span>
        </div>
        <div className="titlebar-right" style={noDragStyle}>
          <button
            className={isPinned ? 'ctrl pinned' : 'ctrl'}
            onClick={togglePin}
            title="Pin on top"
          >
            PIN
          </button>
          <button className="ctrl" onClick={onRefresh} disabled={loading} title="Refresh">
            R
          </button>
          <button className="ctrl" onClick={() => window.windowAPI?.minimize()} title="Minimize">
            _
          </button>
          <button className="ctrl close" onClick={() => window.windowAPI?.close()} title="Close">
            X
          </button>
        </div>
      </div>

      <SportTabs activeSport={activeSport} onSportChange={onSportChange} />

      <div className="content">
        {!sportConfig?.enabled ? (
          <div className="state">
            <p className="state-title">{activeSport} Coming Soon</p>
          </div>
        ) : loading && games.length === 0 ? (
          <div className="state">
            <p className="state-title">Loading...</p>
          </div>
        ) : error ? (
          <div className="state error">
            <p className="state-title">Error</p>
            <p className="state-sub">{error}</p>
            <button className="retry" onClick={onRefresh}>Retry</button>
          </div>
        ) : games.length === 0 ? (
          <div className="state">
            <p className="state-title">No live {activeSport} games</p>
          </div>
        ) : (
          <div className="games-list">
            {games.map(game => (
              <div key={game.id} className="game-placeholder">
                {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
                <span className="game-time">{game.gameTime}</span>
                {game.seriesStatus && <span className="series">{game.seriesStatus}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {lastUpdated && (
        <div className="footer">
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}