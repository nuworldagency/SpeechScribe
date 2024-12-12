'use client'

import AudioRecorder from '@/components/AudioRecorder'
import FileUploader from '@/components/FileUploader'

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">SpeechScribe3 Test</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">Live Recording</h2>
          <AudioRecorder />
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">File Upload</h2>
          <FileUploader />
        </div>
      </div>
    </div>
  )
}
