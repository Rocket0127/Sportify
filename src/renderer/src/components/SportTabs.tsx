import { SPORTS, type SportKey } from '../types/sport'
import './SportTabs.css'
import React, { useState } from 'react'

interface SportTabsProps {
  activeSport: SportKey
  onSportChange: (sport: SportKey) => void
}

export default function SportTabs({ activeSport, onSportChange }: SportTabsProps): React.ReactElement {
  return (
    <div className="sport-tabs">
      {SPORTS.map(sport => (
        <button
          key={sport.key}
          className={[
            'tab',
            activeSport === sport.key ? 'active' : '',
            !sport.enabled          ? 'disabled' : '',
          ].join(' ')}
          onClick={() => onSportChange(sport.key)}
          title={sport.enabled ? sport.label : `${sport.label} — coming soon`}
        >
          {sport.emoji} {sport.label}
          {!sport.enabled && <span className="tba">TBA</span>}
        </button>
      ))}
    </div>
  )
}