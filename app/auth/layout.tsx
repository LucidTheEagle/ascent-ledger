import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BackgroundBeams } from '@/components/ui/background-beams'

export default function AuthCallbackLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ascent-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background — matches onboarding and crisis-triage aesthetic */}
      <BackgroundBeams className="opacity-20" />

      {/* Escape hatch — matches (auth) layout */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-sm text-gray-500 hover:text-white flex items-center gap-2 transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Base
      </Link>

      {/* Content — centered, z-indexed above beams */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}