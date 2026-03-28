import Link from 'next/link'
import { getStations } from '@/services/stationService'

export const revalidate = 60 // revalidate every 60 seconds

async function getStats() {
  try {
    const stations = await getStations()
    const available = stations ? stations.filter(s => s.fuel_status === 'available').length : 0
    const total = stations ? stations.length : 0
    return { total, available }
  } catch (err) {
    console.error('Failed to fetch stats:', err)
    return { total: 0, available: 0 }
  }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <div className="animate-fade-in pb-12">
      {/* Hero */}
      <section className="py-12 md:py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-fuel-accent/5 rounded-full blur-[120px] -z-10" />
        
        <div className="inline-flex items-center gap-2 bg-fuel-card/50 border border-fuel-border backdrop-blur-sm rounded-full px-4 py-1.5 text-[10px] text-fuel-muted font-bold uppercase tracking-[0.2em] mb-8">
          <span className="w-2 h-2 rounded-full bg-fuel-green animate-pulse" />
          Live crowdsource data
        </div>

        <h1 className="font-syne font-extrabold text-5xl md:text-7xl leading-[0.9] mb-6 tracking-tight">
          Find fuel,<br />
          <span className="text-fuel-accent drop-shadow-[0_0_20px_rgba(249,115,22,0.2)]">skip the queue.</span>
        </h1>

        <p className="text-fuel-muted text-base md:text-lg max-w-sm mx-auto leading-relaxed mb-10">
          Real-time fuel availability across Nigeria, powered by drivers like you.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/stations" className="btn-primary py-4 px-8 text-base font-bold uppercase tracking-wider">
            Find Fuel Stations
          </Link>
          <Link href="/report" className="btn-outline py-4 px-8 text-base font-bold uppercase tracking-wider">
            Submit a Report
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mb-16">
        {[
          { value: stats.total, label: 'Stations tracked' },
          { value: stats.available, label: 'With fuel now' },
          { value: '24/7', label: 'Lagos Live' },
        ].map(stat => (
          <div key={stat.label} className="card p-6 text-center flex flex-col items-center justify-center border-white/5 bg-white/[0.02]">
            <div
              className={`font-syne font-extrabold text-fuel-accent mb-1 ${
                stat.value === '24/7' ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
              }`}
            >
              {stat.value}
            </div>
            <div className="text-[10px] text-fuel-muted uppercase font-bold tracking-widest leading-tight">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="max-w-xl mx-auto">
        <h2 className="font-syne font-extrabold text-2xl mb-8 text-center uppercase tracking-widest">How it works</h2>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Find a station',
              desc: 'Browse stations near you and see live fuel availability and queue length.',
            },
            {
              step: '2',
              title: 'Check the crowd data',
              desc: 'Each station shows the last update time so you know how fresh the info is.',
            },
            {
              step: '3',
              title: 'Submit a report',
              desc: 'Help other drivers by reporting what you see at any station in under 10 seconds.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="card p-5 flex gap-5 items-start hover:border-fuel-accent/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-fuel-accent/10 border border-fuel-accent/20 text-fuel-accent font-syne font-bold text-lg flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <div>
                <h3 className="font-syne font-bold text-base mb-1">{title}</h3>
                <p className="text-sm text-fuel-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-[10px] text-fuel-muted uppercase tracking-[0.3em] py-12 border-t border-fuel-border/30 mt-12">
        FuelSpotter NG · Verification Engine Active
      </footer>
    </div>
  )
}
