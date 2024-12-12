import { AssemblyAI } from 'assemblyai'

if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error('ASSEMBLYAI_API_KEY is not set in environment variables')
}

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
})

export interface TranscriptionResult {
  id: string
  text: string
  status: 'completed' | 'error' | 'processing'
  error?: string
}

export class TranscriptionService {
  static async transcribeAudio(audioFile: File): Promise<TranscriptionResult> {
    try {
      // Convert File to ArrayBuffer
      const buffer = await audioFile.arrayBuffer()
      const uint8Array = new Uint8Array(buffer)
      
      // Upload the file
      console.log('Uploading file...')
      const uploadResponse = await client.files.upload(uint8Array, {
        fileName: audioFile.name
      })
      
      if (!uploadResponse.audio_url) {
        throw new Error('Failed to upload audio file')
      }
      
      console.log('Starting transcription...')
      // Start transcription
      const transcript = await client.transcripts.create({
        audio_url: uploadResponse.audio_url,
        language_code: 'en',
        speech_model: 'nano'
      })
      
      // Wait for transcription to complete
      console.log('Waiting for transcription to complete...')
      const result = await client.transcripts.wait(transcript.id)
      
      return {
        id: result.id,
        text: result.text || '',
        status: result.status as 'completed' | 'error' | 'processing',
        error: result.error || undefined
      }
    } catch (error) {
      console.error('Transcription error:', error)
      return {
        id: '',
        text: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
