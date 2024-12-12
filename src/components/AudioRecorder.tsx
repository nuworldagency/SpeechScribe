'use client'

import { useState, useEffect, useRef } from 'react'
import * as assemblyai from 'assemblyai'

const SAMPLE_RATE = 16_000

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const transcriberRef = useRef<any>(null)
  const microphoneStreamRef = useRef<any>(null)

  const onOpen = (sessionOpened: any) => {
    console.log('Session opened with ID:', sessionOpened.session_id)
  }

  const onData = (transcript: any) => {
    if (!transcript.text) return

    if (transcript.is_final) {
      setTranscription(prev => prev + transcript.text + '\n')
    } else {
      setTranscription(prev => {
        // Remove the last line (partial transcription) and add the new one
        const lines = prev.split('\n')
        lines.pop()
        return [...lines, transcript.text].join('\n')
      })
    }
  }

  const onError = (error: any) => {
    console.error('Transcription error:', error)
    setError(`An error occurred: ${error.message || 'Unknown error'}`)
    stopRecording()
  }

  const onClose = () => {
    console.log('Session closed')
  }

  const startRecording = async () => {
    try {
      setError(null)
      setTranscription('')

      // Create transcriber instance
      const transcriber = new assemblyai.RealtimeTranscriber({
        apiKey: process.env.ASSEMBLYAI_API_KEY || '',
        sampleRate: SAMPLE_RATE,
        onOpen,
        onData,
        onError,
        onClose,
      })

      // Connect to AssemblyAI
      await transcriber.connect()
      transcriberRef.current = transcriber

      // Create and start microphone stream
      const micStream = new assemblyai.MicrophoneStream({ sampleRate: SAMPLE_RATE })
      microphoneStreamRef.current = micStream

      // Start streaming audio
      await transcriber.stream(micStream)
      setIsRecording(true)
    } catch (err) {
      setError(`Failed to start recording: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('Recording error:', err)
    }
  }

  const stopRecording = async () => {
    try {
      if (transcriberRef.current) {
        await transcriberRef.current.close()
        transcriberRef.current = null
      }
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.close()
        microphoneStreamRef.current = null
      }
    } catch (err) {
      console.error('Error stopping recording:', err)
    }
    setIsRecording(false)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Live Recording</h2>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-md ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-medium transition-colors`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-medium">Real-time Transcription:</h3>
        <div className="p-4 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap">
          {transcription || 'Start recording to see transcription...'}
        </div>
      </div>
    </div>
  )
}
