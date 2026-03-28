'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/stations', label: 'Stations' },
  { href: '/report', label: 'Report' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (_event === 'SIGNED_OUT') {
        router.push('/')
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  // The login page is now at the root "/"
  const isAuthPage = ['/', '/signup'].includes(pathname)

  return (
    <nav className="sticky top-0 z-50 bg-fuel-surface border-b border-fuel-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={user ? "/home" : "/"} className="font-syne font-semibold text-lg text-fuel-text">
          Fuel<span className="text-fuel-accent">Spotter</span><span className="hidden sm:inline"> NG</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {!isAuthPage && (
            <>
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'text-sm px-3 py-1.5 rounded-lg transition-all duration-150',
                    pathname === href
                      ? 'bg-fuel-card text-fuel-text font-medium'
                      : 'text-fuel-muted hover:text-fuel-text hover:bg-fuel-card/50'
                  )}
                >
                  {label}
                </Link>
              ))}
            </>
          )}

          {!user && !loading && pathname !== '/' && (
            <Link
              href="/"
              className="text-sm px-3 py-1.5 rounded-lg text-fuel-muted hover:text-fuel-text hover:bg-fuel-card/50 transition-all"
            >
              Login
            </Link>
          )}

          <div className="h-4 w-[1px] bg-fuel-border mx-1 hidden sm:block" />

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-fuel-card animate-pulse" />
          ) : user ? (
            <button
              onClick={handleSignOut}
              className="text-sm text-fuel-muted hover:text-fuel-accent px-3 py-1.5 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/signup"
              className={clsx(
                'text-sm px-4 py-1.5 rounded-lg transition-all duration-150',
                pathname === '/signup'
                  ? 'bg-fuel-accent text-white font-medium'
                  : 'bg-fuel-card text-fuel-text border border-fuel-border hover:border-fuel-accent/50'
              )}
            >
              Join now
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
