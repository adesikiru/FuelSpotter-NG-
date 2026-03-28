import { supabase } from './supabaseClient'
import { Station, ReportCounts, FuelStatus, QueueLength } from '@/types'

/**
 * Fetch all stations, ordered by last_updated descending.
 */
export async function getStations(): Promise<Station[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .order('last_updated', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Fetch a single station by ID.
 */
export async function getStationById(id: number | string): Promise<Station | null> {
  if (!supabase) {
    console.error('Supabase is not configured.')
    return null
  }
  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Submit a crowd report and update the station's current status.
 * Runs as two operations: insert report + update station.
 */
export async function submitReport({ stationId, fuelStatus, queueLength, comment }: { stationId: string; fuelStatus: FuelStatus; queueLength: QueueLength; comment: string | null }): Promise<void> {
  if (!supabase) {
    throw new Error('Please configure Supabase credentials in .env.local to submit reports.')
  }
  // 1. Insert into reports table
  const { error: reportError } = await supabase.from('reports').insert({
    station_id: stationId,
    fuel_status: fuelStatus,
    queue_length: queueLength,
    comment: comment || null,
  })

  if (reportError) throw reportError

  // 2. Update the station's current status and last_updated timestamp
  const { error: stationError } = await supabase
    .from('stations')
    .update({
      fuel_status: fuelStatus,
      queue_length: queueLength,
      last_updated: new Date().toISOString(),
    })
    .eq('id', stationId)

  if (stationError) throw stationError
}

/**
 * Get the report count for each station (for reliability indicator).
 */
export async function getReportCounts(): Promise<ReportCounts> {
  if (!supabase) return {}
  const { data, error } = await supabase
    .from('reports')
    .select('station_id')

  if (error) throw error

  // Count reports per station
  return data.reduce((acc: ReportCounts, row: any) => {
    acc[row.station_id] = (acc[row.station_id] || 0) + 1
    return acc
  }, {})
}

/**
 * Subscribe to real-time station updates.
 * Returns the subscription channel so you can unsubscribe later.
 */
export function subscribeToStations(callback: (payload: any) => void) {
  if (!supabase) {
    console.warn('Supabase is not configured. Real-time updates disabled.')
    return { unsubscribe: () => {} }
  }
  return supabase
    .channel('stations-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'stations' }, callback)
    .subscribe()
}
