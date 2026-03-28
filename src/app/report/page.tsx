import { getStations } from '@/services/stationService'
import ReportForm from '@/components/ReportForm'
import { Suspense } from 'react'
import { Station } from '@/types'



export const dynamic = 'force-dynamic'
export const revalidate = 120

export default async function ReportPage() {
  let stations: Station[] = []

  try {
    stations = await getStations()
  } catch {
    // Non-fatal — form still usable with manual entry
  }

  return (
    <div>
      <h1 className="font-syne font-bold text-2xl mb-1">Submit a Report</h1>
      <p className="text-fuel-muted text-sm mb-6">
        Tell other drivers what you see right now. Takes less than 30 seconds.
      </p>
      <Suspense
        fallback={
          <div className="card p-6 text-sm text-fuel-muted">
            Loading report form...
          </div>
        }
      >
        <ReportForm stations={stations} />
      </Suspense>
    </div>
  )
}
