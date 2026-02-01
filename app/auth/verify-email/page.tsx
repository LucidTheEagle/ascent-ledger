'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, RefreshCcw } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [email, setEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // PRIORITY 1: Get email from URL params (most reliable for new signups)
    const emailFromUrl = searchParams.get('email')
    
    if (emailFromUrl) {
      setEmail(emailFromUrl)
      return
    }

    // PRIORITY 2: Get email from session (fallback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setEmail(session.user.email)
      } else {
        // No email found - redirect to signup
        router.push('/sign-up')
      }
    })
  }, [searchParams, supabase.auth, router])

  const handleResend = async () => {
    if (!email) return
    
    setResending(true)
    setError(null)
    
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (resendError) throw resendError

      setResent(true)
      // Reset "resent" message after 10 seconds to allow another try
      setTimeout(() => setResent(false), 10000)
      
    } catch (err: unknown) {
      let errorMsg = 'Failed to resend email.'
      if (
        err &&
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string'
      ) {
        errorMsg = (err as { message: string }).message
      }
      setError(errorMsg)
    } finally {
      setResending(false)
    }
  }

  const handleBackToLogin = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-ascent-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 text-center"
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/10">
          <Mail className="w-10 h-10 text-ascent-blue" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">Check Your Email</h1>
          <div className="space-y-2">
            <p className="text-gray-400">
              We&apos;ve sent a verification link to:
            </p>
            <p className="text-xl text-white font-medium break-all px-4">
              {email || 'Loading...'}
            </p>
          </div>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Click the link in the email to activate your account and access the cockpit.
          </p>
          
          {/* Email Provider Quick Links */}
          {email && (
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <EmailProviderLink 
                name="Gmail" 
                url="https://mail.google.com" 
              />
              <EmailProviderLink 
                name="Outlook" 
                url="https://outlook.live.com" 
              />
              <EmailProviderLink 
                name="Yahoo" 
                url="https://mail.yahoo.com" 
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Resend Button */}
        <div className="space-y-3 pt-4">
          {resent ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm"
            >
              ✓ Verification email resent!
            </motion.div>
          ) : (
            <Button
              onClick={handleResend}
              disabled={resending || !email}
              variant="outline"
              className="w-full h-12 border-gray-700 text-white hover:bg-gray-900 gap-2"
            >
               {resending ? (
                 <RefreshCcw className="w-4 h-4 animate-spin" />
               ) : (
                 <Mail className="w-4 h-4" />
               )}
               {resending ? 'Sending...' : "Resend Verification Email"}
            </Button>
          )}

          <div className="text-xs text-gray-600">
            Can&apos;t find it? Check your Spam/Junk folder.
          </div>
        </div>

        {/* Back to Login */}
        <Button
          onClick={handleBackToLogin}
          variant="ghost"
          className="text-gray-400 hover:text-white gap-2"
        >
          ← Back to Login
        </Button>
      </motion.div>
    </div>
  )
}

function EmailProviderLink({ name, url }: { name: string, url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-xs text-gray-300 hover:text-white hover:border-ascent-blue transition-all flex items-center gap-1 group"
    >
      Open {name}
      <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
    </a>
  )
}