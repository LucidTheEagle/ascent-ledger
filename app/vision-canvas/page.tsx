// app/vision-canvas/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'

// The 6 Questions from Phase 2 specs
const QUESTIONS = [
  {
    id: 1,
    field: 'currentState',
    question: 'Where are you in your career right now?',
    helpText: 'Be specific—role, company type, how long you\'ve been there.',
    placeholder: 'E.g., I\'m 3 years into account management at a marketing agency, managing 5 clients, but unclear what\'s next.',
  },
  {
    id: 2,
    field: 'desiredState',
    question: 'Where do you want to be in 18 months?',
    helpText: 'Not 10 years. Not "someday." 18 months from now—where?',
    placeholder: 'E.g., Leading a team of 3-5 people in a strategic role where I combine marketing + tech understanding.',
  },
  {
    id: 3,
    field: 'successDefinition',
    question: 'What does success look like FOR YOU?',
    helpText: 'Not what your parents expect. Not what your boss wants. What YOU actually want.',
    placeholder: 'E.g., Success means autonomy over my projects, mentoring others, and earning $70K+.',
  },
  {
    id: 4,
    field: 'uniqueSkills',
    question: 'What unique skills or experience do you bring?',
    helpText: 'This isn\'t your resume. This is what makes YOU different.',
    placeholder: 'E.g., Web dev background, marketing strategy experience, client relationship management, data analysis.',
  },
  {
    id: 5,
    field: 'purposeStatement',
    question: 'Why does this matter to you?',
    helpText: 'Purpose. Meaning. The real reason behind the ambition.',
    placeholder: 'E.g., I grew up watching my mom work jobs she hated. I want to build something I\'m proud of.',
  },
  {
    id: 6,
    field: 'antiGoal',
    question: 'What is the specific "Fog" you are ascending from?',
    helpText: 'What are you leaving behind? (e.g., toxic micromanagement, financial instability, invisibility, burnout)',
    placeholder: 'E.g., Micromanagement—being controlled and not trusted.',
  },
]

type VisionData = {
  currentState: string
  desiredState: string
  successDefinition: string
  uniqueSkills: string
  purposeStatement: string
  antiGoal: string
}

export default function VisionCanvasPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [visionData, setVisionData] = useState<VisionData>({
    currentState: '',
    desiredState: '',
    successDefinition: '',
    uniqueSkills: '',
    purposeStatement: '',
    antiGoal: '',
  })
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = QUESTIONS[currentStep]
  const isLastQuestion = currentStep === QUESTIONS.length - 1
  const currentValue = visionData[currentQuestion.field as keyof VisionData]
  const isValid = currentValue.trim().length >= 20

  const handleNext = () => {
    if (!isValid) {
      setError('Please provide at least 20 characters (2-3 sentences).')
      return
    }
    setError(null)
    if (!isLastQuestion) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    setError(null)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setProcessing(true)
    setError(null)

    try {
      // Call API to generate Vision Statement + First Fog Check
      const response = await fetch('/api/vision-canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Vision Statement')
      }

      const data = await response.json()
      
      // Redirect to Vision Result page
      router.push(`/vision-canvas/result?id=${data.visionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-ascent-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-ascent-blue" />
            <h1 className="text-3xl font-bold text-ascent-blue">Vision Canvas</h1>
          </div>
          <p className="text-ascent-gray">Define your altitude. Declare your ascent.</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm text-gray-500">
            <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-ascent-blue to-ascent-purple"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 bg-ascent-card/60 backdrop-blur-lg rounded-xl border border-white/10 p-8"
          >
            <div className="space-y-2">
              <Label className="text-xl font-semibold text-white">
                {currentQuestion.question}
              </Label>
              <p className="text-sm text-gray-400">{currentQuestion.helpText}</p>
            </div>

            <Textarea
              value={currentValue}
              onChange={(e) => {
                setVisionData({
                  ...visionData,
                  [currentQuestion.field]: e.target.value,
                })
                setError(null)
              }}
              placeholder={currentQuestion.placeholder}
              className="min-h-[150px] bg-gray-900 border-gray-700 text-white resize-none focus:border-ascent-blue transition-colors"
              disabled={processing}
              autoFocus
            />

            <div className="flex justify-between items-center text-sm">
              <span className={currentValue.length >= 20 ? 'text-green-500' : 'text-gray-500'}>
                {currentValue.length} characters
              </span>
              {currentValue.length < 20 && currentValue.length > 0 && (
                <span className="text-amber-500">Minimum 20 characters</span>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <Button
            onClick={handleBack}
            disabled={currentStep === 0 || processing}
            variant="outline"
            className="flex-1 h-12 border-gray-700 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isValid || processing}
            className="flex-1 h-12 bg-gradient-to-r from-ascent-blue to-ascent-purple hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Vision...
              </>
            ) : isLastQuestion ? (
              <>
                Complete Vision Canvas
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Skip Option (Optional - only show after first question) */}
        {currentStep > 0 && !processing && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => router.push('/dashboard')}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Complete later (not recommended)
          </motion.button>
        )}
      </div>
    </div>
  )
}