import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'FuelSpotter NG — Find Fuel in Nigeria',
  description: 'Real-time crowd-powered fuel availability tracker for Nigerian drivers.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
