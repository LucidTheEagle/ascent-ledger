'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function VerifyEmailPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    // Get email from session if available
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setEmail(session.user.email)
      }
    })
  }, [supabase.auth])

  const handleResend = async () => {
    if (!email) return
    
    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (!error) {
      setResent(true)
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen bg-ascent-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 text-center"
      >
        {/* Icon */}
        <div className="w-16 h-16 mx-auto bg-ascent-blue/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-ascent-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">Check Your Email</h1>
          <div className="space-y-2">
            <p className="text-gray-400">
              We&apos;ve sent a verification link to:
            </p>
            <p className="text-ascent-blue font-semibold">
              {email || 'your email address'}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Click the link in the email to verify your account and continue to the cockpit.
          </p>
        </div>

        {/* Resend Button */}
        <div className="space-y-2">
          {resent ? (
            <p className="text-ascent-green text-sm">
              ✓ Verification email resent. Check your inbox.
            </p>
          ) : (
            <Button
              onClick={handleResend}
              disabled={resending || !email}
              variant="outline"
              className="w-full border-gray-700 text-white hover:bg-gray-900"
            >
              {resending ? 'Sending...' : "Didn't receive it? Resend"}
            </Button>
          )}
        </div>

        {/* Back to Login */}
        <Button
          onClick={() => router.push('/login')}
          variant="ghost"
          className="w-full text-gray-400 hover:text-white"
        >
          ← Back to login
        </Button>
      </motion.div>
    </div>
  )
}