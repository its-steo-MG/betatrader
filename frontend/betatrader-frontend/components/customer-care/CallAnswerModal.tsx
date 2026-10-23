'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Phone, PhoneOff } from 'lucide-react'

const VOICE_PRESETS = [
  { id: 'default', label: 'Default', emoji: '🤖', description: 'Standard Voice' },
  { id: 'lady', label: 'Lady', emoji: '👩', description: 'Female Voice' },
  { id: 'man', label: 'Man', emoji: '👨', description: 'Male Voice' },
  { id: 'child', label: 'Child', emoji: '👦', description: 'Child Voice' },
]

interface CallAnswerModalProps {
  onAnswer: (voicePreset: string) => Promise<void> | void
  onDecline: () => void
}

export function CallAnswerModal({ onAnswer, onDecline }: CallAnswerModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('default')
  const [isAnswering, setIsAnswering] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const playRing = async () => {
      try {
        audioRef.current = new Audio('/audio/incoming-call.mp3')
        audioRef.current.loop = true
        await audioRef.current.play()
      } catch {
        console.warn('Autoplay prevented by browser')
      }
    }
    playRing()
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleAnswer = async () => {
    if (audioRef.current) audioRef.current.pause()
    setIsAnswering(true)
    try {
      await onAnswer(selectedPreset)
    } catch (error) {
      console.error('Answer failed:', error)
    } finally {
      setIsAnswering(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onDecline}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white
        shadow-[8px_8px_20px_#c8cdd6,-8px_-8px_20px_#ffffff] dark:shadow-none dark:backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Phone className="h-6 w-6 text-cyan-500 animate-pulse" />
            Incoming Call
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-white/50 mb-4">Choose Voice Preset:</p>
            <div className="grid grid-cols-2 gap-3">
              {VOICE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    selectedPreset === preset.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/20 shadow-[3px_3px_6px_#0891b2] dark:shadow-none'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="text-4xl mb-3">{preset.emoji}</div>
                  <div className="font-semibold">{preset.label}</div>
                  <div className="text-xs text-slate-500 dark:text-white/50">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onDecline}
              variant="outline"
              className="flex-1 border-slate-200 dark:border-white/10 shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-none"
              disabled={isAnswering}
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              Decline
            </Button>
            <Button
              onClick={handleAnswer}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none"
              disabled={isAnswering}
            >
              <Phone className="mr-2 h-4 w-4" />
              {isAnswering ? 'Connecting...' : 'Answer Call'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
