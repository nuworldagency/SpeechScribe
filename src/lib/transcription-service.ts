import { AssemblyAI } from 'assemblyai'
import OpenAI from 'openai'

const API_KEY = process.env.ASSEMBLYAI_API_KEY || ''
const assemblyClient = new AssemblyAI({
  apiKey: API_KEY
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface TranscriptionResult {
  id: string
  text: string
  summary: string
  sentiment: string
  keyPoints: string[]
  status: 'processing' | 'completed' | 'error'
  error?: string
  progress?: number
}

interface AssemblyAIResponse {
  upload_url?: string
  id?: string
  status?: string
  text?: string
  error?: string
}

export class TranscriptionService {
  static async uploadFile(file: Buffer): Promise<string> {
    try {
      // Upload directly to AssemblyAI
      const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Transfer-Encoding': 'chunked'
        },
        body: file
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`)
      }

      const data = await uploadResponse.json() as AssemblyAIResponse
      if (!data.upload_url) {
        throw new Error('No upload URL received')
      }

      return data.upload_url
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error('Failed to upload file to AssemblyAI')
    }
  }

  static async processFile(file: Buffer): Promise<TranscriptionResult> {
    try {
      // Upload file to AssemblyAI
      const uploadUrl = await this.uploadFile(file);

      // Create transcription request
      const transcript = await assemblyClient.transcripts.create({
        audio_url: uploadUrl,
        auto_chapters: true,
        sentiment_analysis: true,
        entity_detection: true
      });

      // Wait for transcription to complete
      const result = await assemblyClient.transcripts.wait(transcript.id);

      // Generate summary and insights using ChatGPT
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that analyzes transcripts and provides summaries and key points."
          },
          {
            role: "user",
            content: `Please analyze this transcript and provide a concise summary and 3-5 key points. Transcript: ${result.text}`
          }
        ]
      });

      const analysis = completion.choices[0].message.content;
      const [summary, ...keyPoints] = analysis.split('\n').filter(line => line.trim());

      return {
        id: result.id,
        text: result.text,
        summary: summary.replace('Summary: ', ''),
        sentiment: result.sentiment_analysis_results?.[0]?.sentiment || 'neutral',
        keyPoints: keyPoints.map(point => point.replace(/^[•-]\s*/, '')),
        status: 'completed'
      };
    } catch (error) {
      console.error('Transcription processing error:', error);
      return {
        id: '',
        text: '',
        summary: '',
        sentiment: '',
        keyPoints: [],
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getStatus(transcriptId: string): Promise<TranscriptionResult> {
    try {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': API_KEY
        }
      })

      const transcript = await statusResponse.json() as AssemblyAIResponse

      if (transcript.error) {
        return {
          id: transcriptId,
          text: '',
          summary: '',
          sentiment: '',
          keyPoints: [],
          status: 'error',
          error: transcript.error
        }
      }

      if (transcript.status !== 'completed') {
        return {
          id: transcriptId,
          text: '',
          summary: '',
          sentiment: '',
          keyPoints: [],
          status: 'processing',
          progress: transcript.status === 'processing' ? 50 : 25
        }
      }

      if (!transcript.text) {
        throw new Error('No transcription text received')
      }

      // If completed, analyze with ChatGPT
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Analyze the following transcript and provide:
            1) A concise summary
            2) Overall sentiment
            3) Key points (5-7 bullet points)`
          },
          {
            role: "user",
            content: transcript.text
          }
        ]
      })

      const analysisText = gptResponse.choices[0].message.content
      if (!analysisText) {
        throw new Error('No analysis received from OpenAI')
      }

      const sections = analysisText.split('\n\n')
      const summary = sections[0].replace(/^.*?Summary:?/i, '').trim()
      const sentiment = sections[1].replace(/^.*?Sentiment:?/i, '').trim()
      const keyPoints = sections[2]
        .split('\n')
        .map((point: string) => point.replace(/^[•-]\s*/, '').trim())
        .filter((point: string) => point.length > 0)

      return {
        id: transcriptId,
        text: transcript.text,
        summary,
        sentiment,
        keyPoints,
        status: 'completed'
      }
    } catch (error) {
      console.error('Status check error:', error)
      return {
        id: transcriptId,
        text: '',
        summary: '',
        sentiment: '',
        keyPoints: [],
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static formatTranscriptForDownload(result: TranscriptionResult): string {
    return `
TRANSCRIPTION REPORT
===================

SUMMARY
-------
${result.summary}

SENTIMENT ANALYSIS
----------------
${result.sentiment}

KEY POINTS
---------
${result.keyPoints.map(point => `• ${point}`).join('\n')}

FULL TRANSCRIPT
-------------
${result.text}
`.trim()
  }
}
