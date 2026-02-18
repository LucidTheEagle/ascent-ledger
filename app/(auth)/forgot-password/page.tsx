'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        // Supabase will redirect the user here after they click the email link.
        // CP14 will build this page.
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      // SECURITY: We intentionally do NOT check if the error is "user not found".
      // Always show the success screen regardless — this prevents email enumeration attacks
      // where an attacker probes which emails are registered.
      if (resetError) {
        // Only surface genuine infrastructure errors, not "no account" errors
        const isEnumerationSafe =
          resetError.message.toLowerCase().includes('rate limit') ||
          resetError.message.toLowerCase().includes('too many requests')

        if (isEnumerationSafe) {
          setError('Too many requests. Please wait a few minutes and try again.')
          setIsLoading(false)
          return
        }
      }

      // Always show success — even if email doesn't exist
      setIsSubmitted(true)
    } catch {
      // Catch unexpected errors (network failure etc.) — still show success to prevent enumeration
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Forgot Password?</h1>
        <p className="text-lg text-ascent-gray">
          No fog here. We&apos;ll clear the path.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── SUCCESS STATE ─────────────────────────────────── */}
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-ascent-card/60 border border-white/10 text-center">
              <div className="rounded-full bg-ascent-green/20 p-4">
                <CheckCircle className="h-10 w-10 text-ascent-green" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Check your inbox</h2>
                <p className="text-sm text-ascent-gray max-w-xs mx-auto">
                  If an account exists for{' '}
                  <span className="font-medium text-white">{email}</span>,
                  a reset link is on its way. Check your spam folder too.
                </p>
              </div>

              <p className="text-xs text-gray-600 pt-2">
                The link expires in 1 hour.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300"
              >
                Return to Login
              </Link>

              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                  setError(null)
                }}
                className="text-sm text-gray-500 hover:text-white transition-colors py-2"
              >
                Try a different email
              </button>
            </div>
          </motion.div>

        ) : (

          /* ── FORM STATE ─────────────────────────────────────── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Error State */}
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

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-white block"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="pilot@ascentledger.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="flex h-12 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 pl-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-ascent-blue focus:ring-1 focus:ring-ascent-blue disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="inline-flex w-full items-center justify-center h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Back to login */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}