'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

// Password strength validator
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
    label:
      strength <= 2
        ? 'Weak'
        : strength === 3
        ? 'Fair'
        : strength === 4
        ? 'Good'
        : 'Strong',
    color:
      strength <= 2
        ? 'text-red-500'
        : strength === 3
        ? 'text-amber-500'
        : strength === 4
        ? 'text-blue-500'
        : 'text-green-500',
  }
}

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordStrength = password ? checkPasswordStrength(password) : null

  const handleGoogleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate password strength
    if (passwordStrength && passwordStrength.strength < 3) {
      setError('Password is too weak. Please use a stronger password.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Redirect to verify email page
      router.push('/auth/verify-email')
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Eagle Icon + Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">ASCENT LEDGER</h1>
        <p className="text-lg text-ascent-gray">Your AI Mentor for Career Clarity</p>
        <p className="text-sm text-gray-500">From Fog to Light. From Motion to Progress.</p>
      </div>

      {/* Main CTA or Form */}
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg"
            >
              Begin Your Ascent →
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-ascent-black px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignUp}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-gray-700 text-white hover:bg-gray-900"
            >
              {loading ? 'Loading...' : 'Google'}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Free beta. No credit card required.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleEmailSignUp}
            className="space-y-4"
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                Email
                <span className="text-xs text-gray-500">(We&apos;ll send a verification link)</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-900 border-gray-700 text-white focus:border-ascent-blue"
                placeholder="pilot@ascentledger.com"
              />
            </div>

            {/* Password Field with Toggle */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white flex items-center gap-2">
                <Lock className="w-4 h-4" />
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
                  className="bg-gray-900 border-gray-700 text-white pr-10 focus:border-ascent-blue"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && passwordStrength && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  {/* Strength Bar */}
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

                  {/* Strength Label */}
                  <p className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </p>

                  {/* Requirements Checklist */}
                  <div className="space-y-1 text-xs">
                    <RequirementCheck
                      met={passwordStrength.checks.length}
                      text="At least 8 characters"
                    />
                    <RequirementCheck
                      met={passwordStrength.checks.uppercase}
                      text="One uppercase letter"
                    />
                    <RequirementCheck
                      met={passwordStrength.checks.lowercase}
                      text="One lowercase letter"
                    />
                    <RequirementCheck
                      met={passwordStrength.checks.number}
                      text="One number"
                    />
                    <RequirementCheck
                      met={passwordStrength.checks.special}
                      text="One special character (!@#$%^&*)"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || (passwordStrength?.strength ?? 5) < 3}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Button
              type="button"
              onClick={() => setShowForm(false)}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              ← Back
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-ascent-blue hover:text-ascent-purple transition-colors">
          Log in
        </Link>
      </p>
    </div>
  )
}

// Helper component for password requirements
function RequirementCheck({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 ${met ? 'text-green-500' : 'text-gray-500'}`}>
      {met ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <div className="w-3 h-3 rounded-full border border-current" />
      )}
      <span>{text}</span>
    </div>
  )
}