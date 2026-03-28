'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/services/supabaseClient'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  type: 'login' | 'signup'
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const isLogin = type === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!supabase) {
      setError('Connection failed: Supabase is not configured.')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
        const next = params.get('next') || '/home'
        router.push(next)
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          },
        })
        if (error) throw error
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-10 text-center animate-fade-in max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-fuel-green/30" />
        <div className="w-20 h-20 rounded-full bg-fuel-green/10 text-fuel-green flex items-center justify-center text-3xl mx-auto mb-6 border border-fuel-green/20">
          ✓
        </div>
        <h2 className="font-syne font-bold text-3xl mb-3">Check your inbox</h2>
        <p className="text-fuel-muted text-base leading-relaxed mb-8">
          We've sent a magic link to <span className="text-fuel-text font-semibold">{email}</span>. Click it to verify your account.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="text-fuel-accent text-sm font-bold uppercase tracking-widest hover:text-fuel-accent/80 transition-colors"
        >
          ← Go back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto animate-slide-up">
      <div className="card p-8 md:p-10 relative overflow-hidden backdrop-blur-xl bg-fuel-card/80">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-fuel-accent/10 rounded-full blur-[60px]" />
        
        <header className="mb-10 text-center md:text-left relative">
          <h1 className="font-syne font-extrabold text-3xl md:text-4xl mb-3 tracking-tight">
            {isLogin ? 'Welcome back' : 'Join FuelSpotter'}
          </h1>
          <p className="text-fuel-muted text-sm leading-relaxed max-w-[280px] mx-auto md:mx-0">
            {isLogin 
              ? 'Access real-time fuel data and contribute to the community.' 
              : 'Create an account to help thousands of drivers find fuel across Nigeria.'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-fuel-muted uppercase tracking-[0.2em] ml-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Adesikiru Adeyemo"
                className="input-field py-3.5"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-fuel-muted uppercase tracking-[0.2em] ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="input-field py-3.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-fuel-muted uppercase tracking-[0.2em] ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field py-3.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-fuel-red/10 border border-fuel-red/20 text-fuel-red rounded-xl px-4 py-3 text-xs font-medium animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-fuel-red" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-4 text-base font-bold uppercase tracking-widest mt-4 shadow-xl shadow-fuel-accent/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Working...
              </span>
            ) : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <footer className="mt-10 pt-8 border-t border-fuel-border/50 text-center relative">
          <p className="text-sm text-fuel-muted mb-4">
            {isLogin ? "Don't have an account yet?" : "Already a member?"}
          </p>
          <Link 
            href={isLogin ? '/signup' : '/'} 
            className="inline-flex items-center gap-2 text-fuel-accent font-bold hover:text-white transition-colors group"
          >
            {isLogin ? 'Create one now' : 'Sign in instead'}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </footer>
      </div>

      <div className="mt-8 text-center text-[10px] text-fuel-muted uppercase tracking-[0.4em] opacity-50">
        FuelSpotter NG · Secure Auth Portal
      </div>
    </div>
  )
}
