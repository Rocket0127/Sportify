/** All supported sport identifiers */
export type SportKey = 'NBA' | 'MLB' | 'NHL' | 'NFL'

export interface SportConfig {
  key: SportKey
  label: string
  emoji: string
  /** When false, the tab shows "Coming soon" instead of fetching data */
  enabled: boolean
}

/** Add new sports here — the rest of the app reads from this list */
export const SPORTS: SportConfig[] = [
  { key: 'NBA', label: 'NBA', emoji: '🏀', enabled: true  },
  { key: 'MLB', label: 'MLB', emoji: '⚾', enabled: true  },
  { key: 'NHL', label: 'NHL', emoji: '🏒', enabled: false }, // TBA
  { key: 'NFL', label: 'NFL', emoji: '🏈', enabled: false }, // TBA
]