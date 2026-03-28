import { getStations, getReportCounts } from '@/services/stationService'
import StationsPageClient from '@/components/StationsPageClient'

export const revalidate = 30

import { Station, ReportCounts } from '@/types'

export default async function StationsPage() {
  let stations: Station[] = []
  let reportCounts: ReportCounts = {}
  let error: string | null = null

  try {
    ;[stations, reportCounts] = await Promise.all([getStations(), getReportCounts()])
  } catch (err: any) {
    error = err.message
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-syne font-bold text-2xl">Fuel Stations</h1>
        <span className="text-xs text-fuel-muted">{stations.length} stations</span>
      </div>

      {error ? (
        <div className="card p-6 text-center">
          <p className="text-fuel-red text-sm mb-2">Could not load stations</p>
          <p className="text-fuel-muted text-xs">{error}</p>
        </div>
      ) : (
        <StationsPageClient stations={stations} reportCounts={reportCounts} />
      )}
    </div>
  )
}
