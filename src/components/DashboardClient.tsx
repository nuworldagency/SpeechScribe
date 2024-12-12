'use client'

import { supabase } from '@/lib/supabase'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TranscriptionResult } from '@/lib/transcription-service'

interface DashboardClientProps {
  userId: string
}

export default function DashboardClient({ userId }: DashboardClientProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([])
  const [processingTranscriptions, setProcessingTranscriptions] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    // Poll for status updates of processing transcriptions
    if (processingTranscriptions.length > 0) {
      const interval = setInterval(async () => {
        for (const id of processingTranscriptions) {
          try {
            const response = await fetch(`/api/transcribe?id=${id}`)
            if (!response.ok) throw new Error('Failed to fetch status')
            
            const status = await response.json()
            
            if (status.status === 'completed' || status.status === 'error') {
              setProcessingTranscriptions(prev => prev.filter(tid => tid !== id))
              setTranscriptions(prev => prev.map(t => 
                t.id === id ? status : t
              ))
            }
          } catch (error) {
            console.error('Status check error:', error)
          }
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [processingTranscriptions])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setTranscriptions(prev => [...prev, data])
      setProcessingTranscriptions(prev => [...prev, data.id])
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload file')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary">
                  SpeechScribe
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Audio File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="audio/*"
                              onChange={handleFileUpload}
                              ref={fileInputRef}
                              disabled={isUploading}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">MP3, WAV, M4A up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary-light">
                              Uploading
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-primary">
                              {uploadProgress}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-light">
                          <div
                            style={{ width: `${uploadProgress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {transcriptions.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-lg font-medium text-gray-900">Your Transcriptions</h2>
                      <div className="mt-4 space-y-4">
                        {transcriptions.map((transcription) => (
                          <div
                            key={transcription.id}
                            className="bg-white shadow rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900">
                                {transcription.fileName}
                              </h3>
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  transcription.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : transcription.status === 'error'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {transcription.status}
                              </span>
                            </div>
                            {transcription.status === 'completed' && (
                              <div className="mt-4">
                                <pre className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">
                                  {transcription.transcript}
                                </pre>
                              </div>
                            )}
                            {transcription.status === 'error' && (
                              <div className="mt-2 text-sm text-red-600">
                                {transcription.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
