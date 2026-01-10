// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Sparkles, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  // 1. AUTHENTICATE USER
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // 2. CHECK IF USER HAS COMPLETED VISION CANVAS
  const visionCanvas = await prisma.visionCanvas.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // 3. IF NO VISION CANVAS, REDIRECT TO CREATE ONE
  if (!visionCanvas) {
    redirect('/vision-canvas')
  }

  // 4. FETCH USER DATA (tokens, streak)
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      tokenBalance: true,
      currentStreak: true,
      fullName: true,
    },
  })

  // 5. USER HAS VISION CANVAS - SHOW DASHBOARD
  return (
    <div className="min-h-screen bg-ascent-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Clear Sky{userData?.fullName ? `, ${userData.fullName.split(' ')[0]}` : ''}.
            </h1>
            <p className="text-ascent-gray mt-1">Welcome back, Pilot. Your vision is set.</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Token Balance */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Tokens</p>
              <p className="text-2xl font-bold text-amber-500">{userData?.tokenBalance || 0}</p>
            </div>
            {/* Streak */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-2xl font-bold text-ascent-blue">
                {userData?.currentStreak || 0} 🔥
              </p>
            </div>
          </div>
        </div>

        {/* Vision Card */}
        <div className="bg-ascent-card/60 backdrop-blur-lg rounded-xl border border-white/10 p-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-ascent-blue" />
            <h2 className="text-xl font-semibold text-white">Your Vision</h2>
            <Link 
              href="/vision-canvas" 
              className="ml-auto text-sm text-ascent-blue hover:text-blue-400 transition-colors"
            >
              Edit
            </Link>
          </div>
          <p className="text-white leading-relaxed">
            {visionCanvas.aiSynthesis}
          </p>
        </div>

        {/* This Week's Log Card (Empty State) */}
        <div className="bg-ascent-card/60 backdrop-blur-lg rounded-xl border border-white/10 p-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-ascent-purple" />
            <h2 className="text-xl font-semibold text-white">This Week&apos;s Log</h2>
          </div>
          
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-400">You haven&apos;t logged yet this week.</p>
            <p className="text-gray-500 text-sm">Your vision is waiting.</p>
            
            <Button 
              className="bg-gradient-to-r from-ascent-blue to-ascent-purple hover:from-blue-700 hover:to-purple-700 text-white"
              disabled
            >
              Log This Week (Coming in Sprint 2)
            </Button>
          </div>
        </div>

        {/* Your Ascent Card (Empty State) */}
        <div className="bg-ascent-card/60 backdrop-blur-lg rounded-xl border border-white/10 p-8 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Your Ascent</h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Consistency</p>
              <p className="text-2xl font-bold text-white">0%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weeks Logged</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Chain Status</p>
              <p className="text-lg text-gray-500">Not started</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 pt-4 border-t border-white/10">
            Strategic Log feature coming in Sprint 2
          </p>
        </div>
      </div>
    </div>
  )
}