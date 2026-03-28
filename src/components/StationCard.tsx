import Link from 'next/link'
import clsx from 'clsx'
import { timeAgo, freshnessLabel } from '@/utils/timeFormatter'
import { getReliability } from '@/utils/reliabilityHelper'
import { Station } from '@/types'


const FUEL_CONFIG = {
  available: { label: 'Available', badgeClass: 'badge-available', dot: 'bg-fuel-green' },
  nofuel: { label: 'No Fuel', badgeClass: 'badge-nofuel', dot: 'bg-fuel-red' },
  unknown: { label: 'Unknown', badgeClass: 'badge-unknown', dot: 'bg-fuel-yellow' },
}

const QUEUE_CONFIG = {
  short: { label: 'Short queue', dot: 'bg-fuel-green' },
  medium: { label: 'Medium queue', dot: 'bg-fuel-yellow' },
  long: { label: 'Long queue', dot: 'bg-fuel-red' },
}

function ReliabilityBars({ level, bars }: { level: string, bars: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={clsx('h-1 w-3 rounded-sm', {
            'bg-fuel-green': i <= bars && level === 'high',
            'bg-fuel-yellow': i <= bars && level === 'medium',
            'bg-fuel-red': i <= bars && level === 'low',
            'bg-fuel-border': i > bars,
          })}
        />
      ))}
    </div>
  )
}

export default function StationCard({ station, reportCount = 0 }: { station: Station, reportCount?: number }) {
  const fuel = FUEL_CONFIG[station.fuel_status] ?? FUEL_CONFIG.unknown
  const queue = station.queue_length ? QUEUE_CONFIG[station.queue_length] : null
  const freshness = freshnessLabel(station.last_updated)
  const reliability = getReliability(reportCount)

  return (
    <div className="card p-4 hover:border-fuel-accent/50 transition-colors duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-syne font-bold text-base leading-tight">{station.name}</h3>
          <p className="text-xs text-fuel-muted mt-0.5">{station.area}, Lagos</p>
        </div>
        <span className={fuel.badgeClass}>{fuel.label}</span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fuel-muted">
        {queue && (
          <span className="flex items-center gap-1.5">
            <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', queue.dot)} />
            {queue.label}
          </span>
        )}

        <span className={clsx('flex items-center gap-1', freshness.color)}>
          Updated {timeAgo(station.last_updated)}
        </span>

        <span className="flex items-center gap-1.5">
          <ReliabilityBars level={reliability.level} bars={reliability.bars} />
          <span>{reliability.label}</span>
        </span>
      </div>

      {/* Report CTA */}
      <Link
        href={`/report?station=${station.id}`}
        className="mt-3 block w-full text-center text-xs text-fuel-muted border border-dashed border-fuel-border rounded-lg py-2 hover:border-fuel-accent hover:text-fuel-accent transition-colors duration-150"
      >
        + Submit update for this station
      </Link>
    </div>
  )
}
