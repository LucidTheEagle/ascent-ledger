// app/vision-canvas/result/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import VisionResultClient from '@/app/vision-canvas/result/VisionResultClient'

export default async function VisionResultPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>
}) {
  // 1. AUTHENTICATE USER
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. AWAIT SEARCH PARAMS (NEW IN NEXT.JS 15+)
  const params = await searchParams 
  const visionId = params.id

  if (!visionId) {
    redirect('/dashboard')
  }

  // 3. FETCH VISION CANVAS
  const visionCanvas = await prisma.visionCanvas.findUnique({
    where: { 
      id: visionId,
      userId: user.id, // Security: User can only see their own
    },
  })

  if (!visionCanvas || !visionCanvas.aiSynthesis) {
    redirect('/dashboard')
  }

  // 4. FETCH WEEK 1 FOG CHECK
  const fogCheck = await prisma.fogCheck.findFirst({
    where: {
      userId: user.id,
      fogCheckType: 'WEEK_1',
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!fogCheck) {
    // Fallback if fog check doesn't exist (shouldn't happen)
    redirect('/dashboard')
  }

  // 5. FETCH CURRENT TOKEN BALANCE
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tokenBalance: true },
  })

  // 6. PASS DATA TO CLIENT COMPONENT
  return (
    <VisionResultClient
      visionStatement={visionCanvas.aiSynthesis}
      blindSpot={fogCheck.observation}
      strategicQuestion={fogCheck.strategicQuestion}
      tokensEarned={100}
      totalTokens={userData?.tokenBalance || 100}
    />
  )
}