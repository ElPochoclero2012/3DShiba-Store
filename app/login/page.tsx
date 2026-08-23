'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const authError = searchParams.get('error')

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const passwordInput = form.elements.namedItem('password')
    if (passwordInput instanceof HTMLInputElement) passwordInput.value = ''

    setLoading(true)
    setMessage(null)

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.session) {
        // Confirm email está apagado en Supabase: no manda correo y deja la sesión lista.
        router.push(next)
        router.refresh()
      } else if (!data.user?.identities?.length) {
        setMessage({
          type: 'error',
          text: 'Ese correo ya está registrado. Iniciá sesión.',
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Te enviamos un correo de confirmación. Revisá la casilla y el SPAM.',
        })
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        router.push(next)
        router.refresh()
      }
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-line bg-card p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-ink">
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>
        <p className="mt-2 text-center text-sm text-muted">3DShiba Store</p>

        {(message || authError) && (
          <div
            className={`mt-4 rounded-xl p-3 text-sm ${
              message?.type === 'success'
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {message?.text ?? 'No se pudo completar el inicio de sesión.'}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white p-3 text-sm font-medium text-ink hover:bg-background"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continuar con Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted">o con correo electrónico</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-line bg-background p-2.5"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full rounded-xl border border-line bg-background p-2.5"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-shiba p-3 font-medium text-white hover:bg-shiba-dark disabled:opacity-50"
          >
            {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          {isSignUp ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage(null)
            }}
            className="font-medium text-shiba hover:underline"
          >
            {isSignUp ? 'Iniciá sesión' : 'Registrate'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
