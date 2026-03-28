'use client'

import { useState } from 'react'
import clsx from 'clsx'
import StationList from './StationList'
import LocationRadar from './LocationRadar'
import { Station, ReportCounts } from '@/types'


const TABS = [
  { key: 'all', label: 'All stations' },
  { key: 'radar', label: 'Near me' },
]

export default function StationsPageClient({ stations, reportCounts }: { stations: Station[], reportCounts: ReportCounts }) {
  const [tab, setTab] = useState('all')

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-5 bg-fuel-card border border-fuel-border p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
              tab === t.key
                ? 'bg-fuel-accent text-white'
                : 'text-fuel-muted hover:text-fuel-text'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <StationList initialStations={stations} reportCounts={reportCounts} />
      )}

      {tab === 'radar' && (
        <LocationRadar stations={stations} reportCounts={reportCounts} />
      )}

      <footer className="text-center text-xs text-gray-300 py-6">
         FuelSpotter NG · Built for Lagos Drivers.
      </footer>


    </div>
  )
}
