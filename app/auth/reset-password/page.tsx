'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// Force dynamic rendering — this page reads a live Supabase session
// and must never be statically prerendered.
export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────
// PASSWORD STRENGTH (reusing same logic as sign-up)
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
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-500' : 'text-gray-500'}`}>
      {met
        ? <CheckCircle className="w-3 h-3" />
        : <div className="w-3 h-3 rounded-full border border-current" />
      }
      <span>{text}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// MAIN FORM
// Supabase injects the session via URL hash fragment (#access_token=...) 
// when the user clicks the reset link in their email. The Supabase client
// automatically picks this up — we just call updateUser() with the new password.
// ─────────────────────────────────────────────────────────
function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  const passwordStrength = password ? checkPasswordStrength(password) : null

  // ── Verify we have a valid reset session from Supabase ──
  // Supabase sets the session automatically via the hash fragment.
  // We just need to confirm the user is authenticated before showing the form.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsValidSession(!!session)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!passwordStrength || passwordStrength.strength < 3) {
      setError('Please use a stronger password.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        // Handle the specific "same password" case gracefully
        if (updateError.message.toLowerCase().includes('same password')) {
          setError('Your new password must be different from your current password.')
        } else {
          setError(updateError.message)
        }
        setIsLoading(false)
        return
      }

      setIsSuccess(true)

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch {
      setError('Something went wrong. Please request a new reset link.')
      setIsLoading(false)
    }
  }

  // ── Loading session check ──
  if (isValidSession === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-ascent-blue" />
      </div>
    )
  }

  // ── Invalid / expired session ──
  if (isValidSession === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 p-8 rounded-xl bg-ascent-card/60 border border-white/10 text-center"
      >
        <div className="rounded-full bg-red-500/20 p-4">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Link Expired</h2>
          <p className="text-sm text-ascent-gray max-w-xs mx-auto">
            This password reset link has expired or already been used. Reset links are valid for 1 hour.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex w-full items-center justify-center h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300"
        >
          Request New Link
        </Link>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">

      {/* ── SUCCESS STATE ── */}
      {isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex flex-col items-center gap-6 p-8 rounded-xl bg-ascent-card/60 border border-white/10 text-center"
        >
          <div className="rounded-full bg-ascent-green/20 p-4">
            <CheckCircle className="h-10 w-10 text-ascent-green" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Password Updated</h2>
            <p className="text-sm text-ascent-gray">
              Your password has been reset. Redirecting you to login...
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            Redirecting in 3 seconds
          </div>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300"
          >
            Go to Login Now
          </Link>
        </motion.div>

      ) : (

        /* ── FORM STATE ── */
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white flex items-center gap-2">
              <Lock className="w-4 h-4" />
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="flex h-12 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-ascent-blue focus:ring-1 focus:ring-ascent-blue disabled:opacity-50 transition-colors duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength Indicator */}
            {password && passwordStrength && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 pt-1"
              >
                <div className="flex gap-1">
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
                <p className={`text-xs ${passwordStrength.color}`}>{passwordStrength.label}</p>
                <div className="grid grid-cols-2 gap-1">
                  <RequirementCheck met={passwordStrength.checks.length} text="8+ characters" />
                  <RequirementCheck met={passwordStrength.checks.uppercase} text="Uppercase letter" />
                  <RequirementCheck met={passwordStrength.checks.lowercase} text="Lowercase letter" />
                  <RequirementCheck met={passwordStrength.checks.number} text="Number" />
                  <RequirementCheck met={passwordStrength.checks.special} text="Special char (!@#)" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-white flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className={`flex h-12 w-full rounded-lg border bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 disabled:opacity-50 transition-colors duration-200 ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500'
                    : confirmPassword && confirmPassword === password
                    ? 'border-ascent-green focus:border-ascent-green focus:ring-ascent-green'
                    : 'border-gray-700 focus:border-ascent-blue focus:ring-ascent-blue'
                }`}
                placeholder="••••••••"
              />
              {/* Inline match indicator */}
              {confirmPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {confirmPassword === password
                    ? <CheckCircle className="h-4 w-4 text-ascent-green" />
                    : <AlertCircle className="h-4 w-4 text-red-400" />
                  }
                </div>
              )}
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isLoading ||
              !password ||
              password !== confirmPassword ||
              (passwordStrength?.strength ?? 0) < 3
            }
            className="inline-flex w-full items-center justify-center h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────
// PAGE WRAPPER
// ─────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Reset Password</h1>
        <p className="text-lg text-ascent-gray">
          Set a new password for your account.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ascent-blue" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}