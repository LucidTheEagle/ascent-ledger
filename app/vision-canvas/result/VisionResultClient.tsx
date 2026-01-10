// app/vision-canvas/result/VisionResultClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Coins, ArrowRight, Eye } from 'lucide-react'

type VisionResultClientProps = {
  visionStatement: string
  blindSpot: string
  strategicQuestion: string
  tokensEarned: number
  totalTokens: number
}

export default function VisionResultClient({
  visionStatement,
  blindSpot,
  strategicQuestion,
  tokensEarned,
  totalTokens,
}: VisionResultClientProps) {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState<'vision' | 'fogCheck' | 'tokens'>('vision')
  const [isAnimating, setIsAnimating] = useState(false)

  // Auto-progress delay (optional - remove if you want manual only)
  useEffect(() => {
    if (currentScreen === 'vision') {
      const timer = setTimeout(() => {
        // Auto-advance after 8 seconds (gives time to read)
        // Uncomment if you want auto-progression
        // setCurrentScreen('fogCheck')
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  const handleNext = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    
    if (currentScreen === 'vision') {
      setCurrentScreen('fogCheck')
    } else if (currentScreen === 'fogCheck') {
      setCurrentScreen('tokens')
    } else {
      router.push('/dashboard')
    }

    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <div className="min-h-screen bg-ascent-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
      
      <div className="w-full max-w-3xl space-y-8 z-10">
        
        <AnimatePresence mode="wait">
          {/* SCREEN 1: VISION STATEMENT */}
          {currentScreen === 'vision' && (
            <motion.div
              key="vision"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ascent-blue to-ascent-purple flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-ascent-blue"
              >
                Your Vision
              </motion.h1>
              
              {/* Vision Statement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-8 bg-ascent-card/60 backdrop-blur-lg rounded-xl border border-white/10 relative overflow-hidden"
              >
                {/* Shimmering effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                
                <p className="text-lg md:text-xl leading-relaxed text-white relative z-10">
                  {visionStatement}
                </p>
              </motion.div>

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="bg-gradient-to-r from-ascent-blue to-ascent-purple hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                >
                  Continue to Fog Check
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* SCREEN 2: FOG CHECK (WEEK 1) */}
          {currentScreen === 'fogCheck' && (
            <motion.div
              key="fogCheck"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye className="w-6 h-6 text-ascent-purple" />
                  <h2 className="text-2xl md:text-3xl font-bold text-ascent-purple">
                    Week 1 Fog Check
                  </h2>
                </div>
                <p className="text-gray-400 text-sm">
                  What The Ledger sees that you cannot.
                </p>
              </motion.div>
              
              {/* Fog Check Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 bg-ascent-card/60 backdrop-blur-lg rounded-xl border border-ascent-purple/30 space-y-6"
              >
                {/* Observation (Blind Spot) */}
                <div className="space-y-3">
                  <p className="text-white leading-relaxed text-lg">
                    {blindSpot}
                  </p>
                </div>
                
                {/* Strategic Question */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-ascent-purple font-semibold text-lg leading-relaxed">
                    {strategicQuestion}
                  </p>
                </div>
              </motion.div>

              {/* Optional Reflection Field (Phase 2 feature) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-sm text-gray-500"
              >
                <p>Reflection feature coming in Phase 2</p>
              </motion.div>

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="w-full bg-gradient-to-r from-ascent-blue to-ascent-purple hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* SCREEN 3: TOKEN PAYDAY */}
          {currentScreen === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 text-center"
            >
              {/* Coin Animation */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ 
                  rotateY: [0, 180, 360, 540, 720],
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
                className="flex justify-center"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                  <Coins className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white"
              >
                PAYDAY
              </motion.h2>
              
              {/* Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <p className="text-ascent-gray text-lg">You completed your Vision Canvas.</p>
                <p className="text-ascent-gray text-lg">You earned your first reward.</p>
              </motion.div>

              {/* Token Amount */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              >
                <p className="text-7xl md:text-8xl font-bold text-amber-500">
                  +{tokensEarned}
                </p>
                <p className="text-xl text-gray-400 mt-2">Tokens</p>
              </motion.div>

              {/* Total Balance */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="p-4 bg-ascent-card/40 rounded-lg inline-block"
              >
                <p className="text-sm text-gray-400">Total Balance</p>
                <p className="text-2xl font-bold text-white">{totalTokens} Tokens</p>
              </motion.div>

              {/* Explainer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-sm text-gray-500 max-w-md mx-auto"
              >
                Tokens unlock advanced features as you ascend. For now, focus on the climb.
              </motion.p>

              {/* Enter Cockpit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <Button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="bg-gradient-to-r from-ascent-blue to-ascent-purple hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg"
                >
                  Enter The Cockpit
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}