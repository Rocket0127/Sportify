import { useState, useEffect, useCallback } from 'react'
import MiniPlayer from './components/MiniPlayer'
import type { SportKey } from './types/sport'
import type { NormalizedGame } from './types/game'
import './App.css'

function App(): JSX.Element {
  const [activeSport, setActiveSport]     = useState<SportKey>('NBA')
  const [games, setGames]                 = useState<NormalizedGame[]>([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [lastUpdated, setLastUpdated]     = useState<Date | null>(null)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Steps 11–12 will replace this import with real API calls
      const { getMockGames } = await import('./services/mockData')
      const data = await getMockGames(activeSport)
      setGames(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('fetchGames error:', err)
      setError('Could not load games. Check your connection or API key.')
      setGames([])
    } finally {
      setLoading(false)
    }
  }, [activeSport])

  // Fetch immediately whenever the active sport changes
  useEffect(() => { fetchGames() }, [fetchGames])

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const timer = setInterval(fetchGames, 20_000)
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