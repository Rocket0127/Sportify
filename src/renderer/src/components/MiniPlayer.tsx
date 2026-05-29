import React, { useState, useEffect } from 'react'
import SportTabs from './SportTabs'
import GameDetail from './GameDetail'
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

// Window dimensions for each view (must match main/index.ts initial size)
const LIST_SIZE   = { width: 400, height: 650 }
const DETAIL_SIZE = { width: 700, height: 520 }

export default function MiniPlayer(props: MiniPlayerProps): React.ReactElement {
  const { activeSport, onSportChange, games, loading, error, lastUpdated, onRefresh } = props
  const [isPinned, setIsPinned] = useState(true)

  // Which game is currently opened in detail view? null = list view.
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)

  // Find the latest version of the selected game (auto-refresh keeps it fresh)
  const selectedGame = selectedGameId
    ? games.find(g => g.id === selectedGameId) ?? null
    : null

  // If the selected game disappears (e.g. game ended, no longer live), pop back
  useEffect(() => {
    if (selectedGameId && !selectedGame) setSelectedGameId(null)
  }, [selectedGameId, selectedGame])

  // Resize the Electron window when toggling between list/detail
  useEffect(() => {
    const size = selectedGame ? DETAIL_SIZE : LIST_SIZE
    window.windowAPI?.resize(size.width, size.height)
  }, [selectedGame])

  const sportConfig = SPORTS.find(s => s.key === activeSport)

  function togglePin() {
    const next = !isPinned
    setIsPinned(next)
    window.windowAPI?.setAlwaysOnTop(next)
  }

  const dragStyle   = { WebkitAppRegion: 'drag' } as React.CSSProperties
  const noDragStyle = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

  return (
    <div className="miniplayer">
      {/* ── TITLE BAR ──────────────────────────────────────── */}
      <div className="titlebar" style={dragStyle}>
        <div className="titlebar-left">
          <span className="app-title">MiniScore</span>
        </div>
        <div className="titlebar-right" style={noDragStyle}>
          <button className={isPinned ? 'ctrl pinned' : 'ctrl'} onClick={togglePin} title="Pin on top">PIN</button>
          <button className="ctrl" onClick={onRefresh} disabled={loading} title="Refresh">R</button>
          <button className="ctrl" onClick={() => window.windowAPI?.minimize()} title="Minimize">_</button>
          <button className="ctrl close" onClick={() => window.windowAPI?.close()} title="Close">X</button>
        </div>
      </div>

      {/* ── BODY: either detail view OR list view ─────────── */}
      {selectedGame ? (
        <div className="content slide-in-right">
          <GameDetail game={selectedGame} onBack={() => setSelectedGameId(null)} />
        </div>
      ) : (
        <>
          <SportTabs activeSport={activeSport} onSportChange={onSportChange} />
          <div className="content slide-in-left">
            {!sportConfig?.enabled ? (
              <div className="state"><p className="state-title">{activeSport} Coming Soon</p></div>
            ) : loading && games.length === 0 ? (
              <div className="state"><p className="state-title">Loading...</p></div>
            ) : error ? (
              <div className="state error">
                <p className="state-title">Error</p>
                <p className="state-sub">{error}</p>
                <button className="retry" onClick={onRefresh}>Retry</button>
              </div>
            ) : games.length === 0 ? (
  <div className="state">
    <p className="state-title">No live {activeSport} games right now</p>
    <p className="state-sub">Check back when games are scheduled</p>
  </div>
            ) : (
              <div className="games-list">
                {games.map(game => (
                  <button
                    key={game.id}
                    className="game-row"
                    onClick={() => setSelectedGameId(game.id)}
                  >
                    <span className="game-matchup">
                      {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
                    </span>
                    <span className="game-time">{game.gameTime}</span>
                    {game.seriesStatus && <span className="series">{game.seriesStatus}</span>}
                    <span className="game-arrow">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── FOOTER ─────────────────────────────────────────── */}
      {lastUpdated && (
        <div className="footer">
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}