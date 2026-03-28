'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { submitReport } from '@/services/stationService'
import { Station } from '@/types'


const FUEL_OPTIONS = [
  { value: 'available', label: 'Available', icon: '⛽', color: 'text-fuel-green' },
  { value: 'nofuel', label: 'No Fuel', icon: '🚫', color: 'text-fuel-red' },
]

const QUEUE_OPTIONS = [
  { value: 'short', label: 'Short', icon: '🟢', desc: 'Under 10 cars' },
  { value: 'medium', label: 'Medium', icon: '🟡', desc: '10–30 cars' },
  { value: 'long', label: 'Long', icon: '🔴', desc: '30+ cars' },
]

function RadioCard({ option, name, selected, onChange }: { option: { value: string, label: string, icon: string, color?: string, desc?: string }, name: string, selected: string, onChange: (val: string) => void }) {
  return (
    <label
      className={clsx(
        'flex-1 min-w-[90px] bg-fuel-bg border rounded-xl p-3 cursor-pointer transition-all duration-150 text-center',
        selected === option.value
          ? 'border-fuel-accent bg-fuel-accent/8'
          : 'border-fuel-border hover:border-fuel-border/80'
      )}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={selected === option.value}
        onChange={() => onChange(option.value)}
        className="sr-only"
      />
      <div className="text-xl mb-1">{option.icon}</div>
      <div className={clsx('text-xs font-medium', option.color ?? 'text-fuel-text')}>
        {option.label}
      </div>
      {option.desc && (
        <div className="text-xs text-fuel-muted mt-0.5">{option.desc}</div>
      )}
    </label>
  )
}

export default function ReportForm({ stations }: { stations: Station[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [stationId, setStationId] = useState('')
  const [fuelStatus, setFuelStatus] = useState('')
  const [queueLength, setQueueLength] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill station from query param (?station=id)
  useEffect(() => {
    const preselect = searchParams.get('station')
    if (preselect) setStationId(preselect)
  }, [searchParams])

  // Hide queue selector when no fuel
  const showQueue = fuelStatus === 'available'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stationId || !fuelStatus) {
      setError('Please select a station and fuel status.')
      return
    }
    if (fuelStatus === 'available' && !queueLength) {
      setError('Please select the queue length.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await submitReport({
        stationId,
        fuelStatus: fuelStatus as import('@/types').FuelStatus,
        queueLength: (fuelStatus === 'available' ? queueLength : null) as import('@/types').QueueLength,
        comment,
      })
      setSuccess(true)
      setStationId('')
      setFuelStatus('')
      setQueueLength('')
      setComment('')
      // Redirect to stations after 2.5s
      setTimeout(() => router.push('/stations'), 2500)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      {success && (
        <div className="bg-fuel-green/10 border border-fuel-green/30 text-fuel-green rounded-xl px-4 py-3 text-sm mb-5">
          ✓ Report submitted! Redirecting to stations…
        </div>
      )}

      {error && (
        <div className="bg-fuel-red/10 border border-fuel-red/30 text-fuel-red rounded-xl px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Station select */}
        <div>
          <label className="block text-xs font-medium text-fuel-muted uppercase tracking-widest mb-2">
            Station
          </label>
          <select
            value={stationId}
            onChange={e => setStationId(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select a station…</option>
            {stations.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.area}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel status */}
        <div>
          <label className="block text-xs font-medium text-fuel-muted uppercase tracking-widest mb-2">
            Fuel status
          </label>
          <div className="flex gap-3">
            {FUEL_OPTIONS.map(opt => (
              <RadioCard
                key={opt.value}
                option={opt}
                name="fuel-status"
                selected={fuelStatus}
                onChange={setFuelStatus}
              />
            ))}
          </div>
        </div>

        {/* Queue length — only shown when fuel is available */}
        {showQueue && (
          <div>
            <label className="block text-xs font-medium text-fuel-muted uppercase tracking-widest mb-2">
              Queue length
            </label>
            <div className="flex gap-3">
              {QUEUE_OPTIONS.map(opt => (
                <RadioCard
                  key={opt.value}
                  option={opt}
                  name="queue"
                  selected={queueLength}
                  onChange={setQueueLength}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional comment */}
        <div>
          <label className="block text-xs font-medium text-fuel-muted uppercase tracking-widest mb-2">
            Comment <span className="normal-case text-fuel-muted/60">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="input-field resize-none"
            rows={3}
            placeholder="e.g. PMS only, ATM not working, closes at 6pm…"
            maxLength={280}
          />
          <p className="text-right text-xs text-fuel-muted mt-1">{comment.length}/280</p>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className={clsx(
            'w-full py-3.5 rounded-xl font-syne font-bold text-base tracking-wide transition-all duration-150',
            loading || success
              ? 'bg-fuel-border text-fuel-muted cursor-not-allowed'
              : 'bg-fuel-accent text-white hover:bg-orange-600 active:scale-[0.99]'
          )}
        >
          {loading ? 'Submitting…' : 'Submit Report'}
        </button>
      </form>


      <footer className="text-center text-xs text-gray-300 py-6">
        FuelSpotter NG · Built for Lagos Drivers.
      </footer>

    </div>
  )
}
