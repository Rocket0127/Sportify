import React, { useState, useEffect, useCallback } from 'react'
import MiniPlayer from './components/MiniPlayer'
import type { SportKey } from './types/sport'
import type { NormalizedGame } from './types/game'
import './App.css'

function App(): React.ReactElement {
  const [activeSport, setActiveSport]     = useState<SportKey>('NBA')
  const [games, setGames]                 = useState<NormalizedGame[]>([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [lastUpdated, setLastUpdated]     = useState<Date | null>(null)

const fetchGames = useCallback(async () => {
  setLoading(true)
  setError(null)
  try {
    let data: NormalizedGame[] = []

    if (activeSport === 'NBA') {
      // ── Real API ──
      const { fetchNBAGames } = await import('./services/nbaService')
      data = await fetchNBAGames()
    } else {
      // Other sports still use mock data for now
      const { getMockGames } = await import('./services/mockData')
      data = await getMockGames(activeSport)
    }

    setGames(data)
    setLastUpdated(new Date())
  } catch (err) {
    console.error('fetchGames error:', err)
    setError(err instanceof Error ? err.message : 'Could not load games.')
    setGames([])
  } finally {
    setLoading(false)
  }
}, [activeSport])

  // Fetch immediately whenever the active sport changes
  useEffect(() => { fetchGames() }, [fetchGames])

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const timer = setInterval(fetchGames, 35_000)  // every 35s — safely under rate limit
    return () => clearInterval(timer) // Clean up on unmount
  }, [fetchGames])

  return (
    <MiniPlayer
      activeSport={activeSport}
      onSportChange={setActiveSport}
      games={games}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={fetchGames}
    />
  )
}

export default App