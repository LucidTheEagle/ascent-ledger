'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Target, Shield, ArrowRight } from 'lucide-react'

export default function OnboardingFork() {
  const router = useRouter()
  const [hoveredPath, setHoveredPath] = useState<'vision' | 'crisis' | null>(null)

  const handlePathSelection = (path: 'vision' | 'crisis') => {
    if (path === 'vision') {
      router.push('/vision-canvas')
    } else {
      router.push('/crisis-triage')
    }
  }

  return (
    <div className="min-h-screen bg-ascent-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle Background Glow Effect */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          hoveredPath === 'vision' 
            ? 'bg-gradient-to-br from-blue-900/10 via-transparent to-transparent' 
            : hoveredPath === 'crisis'
            ? 'bg-gradient-to-br from-amber-900/10 via-transparent to-transparent'
            : 'bg-transparent'
        }`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full space-y-12 z-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold"
          >
            Welcome to <span className="text-ascent-blue">Ascent Ledger</span>.
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <p className="text-xl text-ascent-gray max-w-2xl mx-auto">
              Most people are busy but unclear if they&apos;re progressing.
            </p>
            <p className="text-lg text-ascent-gray">
              You&apos;re about to change that.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base text-gray-500 pt-4"
          >
            Before we begin, tell us where you are right now:
          </motion.p>
        </div>

        {/* The Fork - Two Paths */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-2 gap-6"
        >
          
          {/* PATH A: THE OPTIMIST (Vision Track) */}
          <button
            onClick={() => handlePathSelection('vision')}
            onMouseEnter={() => setHoveredPath('vision')}
            onMouseLeave={() => setHoveredPath(null)}
            className="group relative p-8 rounded-xl bg-ascent-card/60 backdrop-blur-lg border border-white/10 hover:border-ascent-blue/50 transition-all duration-300 text-left"
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-lg bg-ascent-blue/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-ascent-blue" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-white group-hover:text-ascent-blue transition-colors">
                I'm ready to build my vision
              </h3>
              <p className="text-ascent-gray group-hover:text-gray-300 transition-colors">
                Clear mental space, thinking ahead
              </p>
              <p className="text-sm text-gray-500">
                For those with capacity to think 18 months ahead. You want strategy, clarity, and a plan.
              </p>
            </div>

            {/* CTA Arrow */}
            <div className="flex items-center gap-2 mt-6 text-sm font-medium text-ascent-blue opacity-0 group-hover:opacity-100 transition-opacity">
              Begin Ascent
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-xl bg-ascent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* PATH B: THE DROWNING MAN (Crisis Track) */}
          <button
            onClick={() => handlePathSelection('crisis')}
            onMouseEnter={() => setHoveredPath('crisis')}
            onMouseLeave={() => setHoveredPath(null)}
            className="group relative p-8 rounded-xl bg-ascent-card/60 backdrop-blur-lg border border-white/10 hover:border-ascent-amber/50 transition-all duration-300 text-left"
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-lg bg-ascent-amber/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-ascent-amber" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-white group-hover:text-ascent-amber transition-colors">
                I need to survive this week
              </h3>
              <p className="text-ascent-gray group-hover:text-gray-300 transition-colors">
                Overwhelmed, crisis mode, need immediate help
              </p>
              <p className="text-sm text-gray-500">
                For those in toxic environments, burnout, or crisis. You need oxygen, not a 5-year plan.
              </p>
            </div>

            {/* CTA Arrow */}
            <div className="flex items-center gap-2 mt-6 text-sm font-medium text-ascent-amber opacity-0 group-hover:opacity-100 transition-opacity">
              Get Oxygen Mask
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-xl bg-ascent-amber/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

        </motion.div>

        {/* Footer Assessment Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <button className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
            Not sure? Take the quick assessment
          </button>
          <p className="text-xs text-gray-700 mt-1">(Coming in Phase 2)</p>
        </motion.div>

      </motion.div>
    </div>
  )
}