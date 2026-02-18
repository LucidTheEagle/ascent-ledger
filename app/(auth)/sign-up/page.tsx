'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, User, Loader2 } from 'lucide-react'

// ─────────────────────────────────────────────────────────
// Google Icon
// ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────
// PASSWORD STRENGTH
// ─────────────────────────────────────────────────────────
function checkPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  const strength = Object.values(checks).filter(Boolean).length
  return {
    checks,
    strength,
    label: strength <= 2 ? 'Weak' : strength === 3 ? 'Fair' : strength === 4 ? 'Good' : 'Strong',
    color: strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-amber-500' : strength === 4 ? 'text-blue-500' : 'text-green-500',
  }
}

function RequirementCheck({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 ${met ? 'text-green-500' : 'text-gray-500'}`}>
      {met
        ? <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
        : <div className="w-3 h-3 rounded-full border border-current" aria-hidden="true" />
      }
      <span className="text-xs">{text}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// LOADING STATE TYPE
// ─────────────────────────────────────────────────────────
type LoadingState = 'idle' | 'email' | 'google'

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  const isLoading = loadingState !== 'idle'
  const passwordStrength = password ? checkPasswordStrength(password) : null

  // ── Google OAuth ──────────────────────────────────────
  const handleGoogleSignUp = async () => {
    setLoadingState('google')
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Failed to connect with Google. Please try again.'
      )
      setLoadingState('idle')
    }
  }

  // ── Email / Password ──────────────────────────────────
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!passwordStrength || passwordStrength.strength < 3) {
      setError('Password is too weak. Add uppercase, numbers, or special characters.')
      return
    }

    setLoadingState('email')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName },
        },
      })

      if (error) throw error

      if (data?.user && !data.session) {
        // Email confirmation required
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
      } else if (data?.session) {
        // Email confirmation disabled — direct login
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : ''
      const friendly = raw.toLowerCase().includes('already registered')
        ? 'An account with this email already exists. Try logging in instead.'
        : raw.toLowerCase().includes('password')
        ? 'Password does not meet requirements. Please try a stronger one.'
        : raw.toLowerCase().includes('rate limit') || raw.toLowerCase().includes('too many')
        ? 'Too many attempts. Wait a moment and try again.'
        : raw || 'Failed to create account. Please try again.'

      setError(friendly)
      setLoadingState('idle')
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">ASCENT LEDGER</h1>
        <p className="text-lg text-ascent-gray">Your AI Mentor for Career Clarity</p>
        <p className="text-sm text-gray-500">From Fog to Light. From Motion to Progress.</p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── CTA VIEW ──────────────────────────────────── */}
        {!showForm ? (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg"
              aria-label="Create an account with email"
            >
              Begin Your Ascent →
            </Button>

            <div className="relative" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-ascent-black px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 border-gray-700 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign up with Google"
            >
              {loadingState === 'google' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Connecting...
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Google
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Free beta access. No credit card required.
            </p>
          </motion.div>

        ) : (

          /* ── FORM VIEW ────────────────────────────────── */
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            onSubmit={handleEmailSignUp}
            className="space-y-5"
            noValidate
          >
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-start gap-2"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white flex items-center gap-2">
                <User className="w-4 h-4" aria-hidden="true" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                aria-label="Full name"
                disabled={isLoading}
                className="bg-gray-900 border-gray-700 text-white h-12 focus:border-ascent-blue"
                placeholder="Victor Eagle"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-label="Email address"
                disabled={isLoading}
                className="bg-gray-900 border-gray-700 text-white h-12 focus:border-ascent-blue"
                placeholder="pilot@ascentledger.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white flex items-center gap-2">
                <Lock className="w-4 h-4" aria-hidden="true" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-label="Password"
                  aria-describedby="password-strength"
                  disabled={isLoading}
                  className="bg-gray-900 border-gray-700 text-white h-12 pr-11 focus:border-ascent-blue"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye className="w-4 h-4" aria-hidden="true" />
                  }
                </button>
              </div>

              {/* Strength Meter */}
              {password && passwordStrength && (
                <motion.div
                  id="password-strength"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                  aria-label={`Password strength: ${passwordStrength.label}`}
                >
                  <div className="flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color.replace('text-', 'bg-')
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </p>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <RequirementCheck met={passwordStrength.checks.length} text="8+ characters" />
                    <RequirementCheck met={passwordStrength.checks.uppercase} text="Uppercase letter" />
                    <RequirementCheck met={passwordStrength.checks.lowercase} text="Lowercase letter" />
                    <RequirementCheck met={passwordStrength.checks.number} text="Number" />
                    <RequirementCheck met={passwordStrength.checks.special} text="Special char (!@#)" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading || (passwordStrength?.strength ?? 0) < 3}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Create your account"
            >
              {loadingState === 'email' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Terms — prefetch disabled, opens safely */}
            <p className="text-xs text-center text-gray-600 px-4">
              By creating an account, you agree to our{' '}
              <Link
                href="/terms"
                prefetch={false}
                className="underline hover:text-gray-400 transition-colors"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                prefetch={false}
                className="underline hover:text-gray-400 transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>

            {/* Back */}
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setError(null)
                setPassword('')
                setEmail('')
                setFullName('')
              }}
              className="w-full text-sm text-gray-500 hover:text-white transition-colors py-2"
              aria-label="Go back to sign up options"
            >
              ← Back
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Login link */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-ascent-blue hover:text-ascent-purple transition-colors font-medium"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}