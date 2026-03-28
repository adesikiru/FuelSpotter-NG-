'use client'

import { useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import StationCard from './StationCard'
import { subscribeToStations } from '@/services/stationService'
import { getUserLocation, sortByDistance, formatDistance, haversineDistance } from '@/utils/distanceCalculator'
import { Station, ReportCounts } from '@/types'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Fuel Available' },
  { key: 'nofuel', label: 'No Fuel' },
  { key: 'unknown', label: 'Unknown' },
]

export default function StationList({ initialStations, reportCounts }: { initialStations: Station[], reportCounts: ReportCounts }) {
  const [stations, setStations] = useState(initialStations)
  const [filter, setFilter] = useState('all')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = subscribeToStations((payload: any) => {
      if (payload.eventType === 'UPDATE') {
        setStations(prev =>
          prev.map(s => s.id === payload.new.id ? payload.new : s)
        )
      } else if (payload.eventType === 'INSERT') {
        setStations(prev => [payload.new, ...prev])
      }
    })
    return () => { channel.unsubscribe() }
  }, [])

  const handleLocate = useCallback(async () => {
    setLocationLoading(true)
    setLocationError(null)
    try {
      const loc = await getUserLocation()
      setUserLocation(loc)
    } catch (e) {
      setLocationError('Could not get your location. Please allow location access.')
    } finally {
      setLocationLoading(false)
    }
  }, [])

  // Apply filter
  const filtered = filter === 'all'
    ? stations
    : stations.filter(s => s.fuel_status === filter)

  // Sort by distance if user location is known
  const displayed = userLocation
    ? sortByDistance(filtered, userLocation.lat, userLocation.lng)
    : filtered

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-lg border transition-colors duration-150 font-medium',
              filter === f.key
                ? 'bg-fuel-accent/10 border-fuel-accent text-fuel-text'
                : 'bg-fuel-card border-fuel-border text-fuel-muted hover:text-fuel-text'
            )}
          >
            {f.label}
          </button>
        ))}

        <button
          onClick={handleLocate}
          disabled={locationLoading}
          className={clsx(
            'ml-auto text-xs px-3 py-1.5 rounded-lg border transition-colors duration-150 font-medium flex items-center gap-1.5',
            userLocation
              ? 'bg-fuel-green/10 border-fuel-green/30 text-fuel-green'
              : 'bg-fuel-card border-fuel-border text-fuel-muted hover:text-fuel-text'
          )}
        >
          {locationLoading ? (
            <span className="w-2 h-2 rounded-full bg-fuel-accent animate-pulse" />
          ) : (
            <span>⊙</span>
          )}
          {userLocation ? 'Sorted by distance' : 'Sort by distance'}
        </button>
      </div>

      {locationError && (
        <p className="text-xs text-fuel-red mb-3">{locationError}</p>
      )}

      {/* Station cards */}
      {displayed.length === 0 ? (
        <div className="card p-10 text-center text-fuel-muted text-sm">
          No stations match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(station => (
            <div key={station.id}>
              {userLocation && station.latitude && station.longitude && (
                <p className="text-xs text-fuel-muted mb-1 pl-1">
                  {formatDistance(
                    haversineDistance(
                      userLocation.lat, userLocation.lng,
                      station.latitude, station.longitude
                    )
                  )}
                </p>
              )}
              <StationCard
                station={station}
                reportCount={reportCounts[station.id] ?? 0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
