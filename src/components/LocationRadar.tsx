'use client'

import { useState, useCallback } from 'react'
import clsx from 'clsx'
import StationCard from './StationCard'
import { getUserLocation, haversineDistance, formatDistance, sortByDistance } from '@/utils/distanceCalculator'
import { Station, ReportCounts } from '@/types'


const LAGOS_AREAS = [
  { label: 'Ikeja',           lat: 6.5955, lng: 3.3384 },
  { label: 'Lekki Phase 1',   lat: 6.4281, lng: 3.5237 },
  { label: 'Yaba',            lat: 6.5095, lng: 3.3711 },
  { label: 'Victoria Island', lat: 6.4248, lng: 3.4177 },
  { label: 'Surulere',        lat: 6.4967, lng: 3.3515 },
  { label: 'Maryland',        lat: 6.5538, lng: 3.3590 },
  { label: 'Ikorodu',         lat: 6.6194, lng: 3.5078 },
  { label: 'Ajah',            lat: 6.4659, lng: 3.5826 },
  { label: 'Apapa',           lat: 6.4480, lng: 3.3602 },
  { label: 'Gbagada',         lat: 6.5570, lng: 3.3859 },
  { label: 'Ojota',           lat: 6.6018, lng: 3.3515 },
  { label: 'Ketu',            lat: 6.5833, lng: 3.3667 },
  { label: 'Badagry',         lat: 6.4698, lng: 2.8894 },
  { label: 'Epe',             lat: 6.5833, lng: 3.9833 },
  { label: 'Mushin',          lat: 6.5244, lng: 3.3792 },
  { label: 'Oshodi',          lat: 6.5026, lng: 3.3753 },
  { label: 'Lagos Island',    lat: 6.4531, lng: 3.3958 },
  { label: 'Agege',           lat: 6.6352, lng: 3.3167 },
]

export default function LocationRadar({ stations = [], reportCounts = {} }: { stations?: Station[], reportCounts?: ReportCounts }) {
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [radius, setRadius] = useState(5)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState('')

  const handleGPS = useCallback(async () => {
    setGpsLoading(true)
    setGpsError(null)
    try {
      const { lat, lng } = await getUserLocation()
      setUserLat(lat)
      setUserLng(lng)
      setLocationLabel('GPS location')
      setSelectedArea('')
    } catch {
      setGpsError('GPS denied — please pick your area below.')
    } finally {
      setGpsLoading(false)
    }
  }, [])

  function handleAreaSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setSelectedArea(val)
    if (!val) {
      setUserLat(null)
      setUserLng(null)
      setLocationLabel(null)
      return
    }
    const area = LAGOS_AREAS.find(a => a.label === val)
    if (area) {
      setUserLat(area.lat)
      setUserLng(area.lng)
      setLocationLabel(area.label + ', Lagos')
      setGpsError(null)
    }
  }

  // Filter + sort stations within radius
  const inZone = (userLat !== null && userLng !== null)
    ? sortByDistance(stations, userLat, userLng)
        .map(s => ({
          ...s,
          distance: haversineDistance(userLat, userLng, s.latitude, s.longitude),
        }))
        .filter(s => s.distance <= radius)
    : []

  return (
    <div className="space-y-4">
      {/* Location picker card */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-fuel-green/15 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="7" r="2.5" stroke="#22c55e" strokeWidth="1.5"/>
              <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="#22c55e" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-fuel-muted">Your location</p>
            <p className="text-sm font-medium">
              {locationLabel ?? 'Not set'}
            </p>
          </div>
        </div>

        {/* GPS button */}
        <button
          onClick={handleGPS}
          disabled={gpsLoading}
          className={clsx(
            'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-colors duration-150',
            locationLabel === 'GPS location'
              ? 'bg-fuel-green/10 border-fuel-green/30 text-fuel-green'
              : 'bg-fuel-card border-fuel-border text-fuel-text hover:border-fuel-accent'
          )}
        >
          <span className={clsx('w-2 h-2 rounded-full', gpsLoading ? 'bg-fuel-accent animate-pulse' : 'bg-fuel-green')} />
          {gpsLoading ? 'Locating…' : locationLabel === 'GPS location' ? 'GPS active' : 'Use my GPS'}
        </button>

        {gpsError && (
          <p className="text-xs text-fuel-red mt-2">{gpsError}</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-2 my-4 text-xs text-fuel-muted">
          <div className="flex-1 h-px bg-fuel-border" />
          or pick your area
          <div className="flex-1 h-px bg-fuel-border" />
        </div>

        {/* Area dropdown */}
        <select
          value={selectedArea}
          onChange={handleAreaSelect}
          className="input-field"
        >
          <option value="">Select Lagos area…</option>
          {LAGOS_AREAS.map(area => (
            <option key={area.label} value={area.label}>{area.label}</option>
          ))}
        </select>

        {/* Radius slider */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-xs text-fuel-muted whitespace-nowrap">Search radius</span>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            className="flex-1 accent-fuel-accent"
          />
          <span className="text-sm font-medium w-12 text-right">{radius} km</span>
        </div>
      </div>

      {/* Results */}
      {userLat !== null && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-syne font-bold text-lg">Stations in your zone</h2>
            <span className="text-xs text-fuel-muted">{inZone.length} found</span>
          </div>

          {inZone.length === 0 ? (
            <div className="card p-10 text-center text-fuel-muted text-sm">
              No stations found within {radius}km.
              <br />
              <button
                onClick={() => setRadius(r => Math.min(r + 5, 20))}
                className="mt-3 text-fuel-accent text-xs underline"
              >
                Try a wider radius
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {inZone.map(station => (
                <div key={station.id}>
                  <p className="text-xs text-fuel-muted mb-1 pl-1">
                    {formatDistance(station.distance)}
                  </p>
                  <StationCard
                    station={station}
                    reportCount={reportCounts[station.id] ?? 0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
