// Mock external modules before importing the service
jest.mock('assemblyai', () => {
  return {
    AssemblyAI: jest.fn().mockImplementation(() => ({
      transcribe: jest.fn(),
      transcript: {
        get: jest.fn(),
      },
    })),
  }
})

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  }
})

import { TranscriptionService } from '../transcription-service'

describe('TranscriptionService', () => {
  let mockAssemblyAI: any
  let mockOpenAI: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Get the mock instances
    mockAssemblyAI = new (require('assemblyai').AssemblyAI)()
    mockOpenAI = new (require('openai').default)()
  })

  describe('uploadFile', () => {
    it('should upload file to AssemblyAI', async () => {
      const mockResponse = { upload_url: 'https://example.com/upload' }
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const buffer = Buffer.from('test audio content')
      const result = await TranscriptionService.uploadFile(buffer)

      expect(result).toBe(mockResponse.upload_url)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.assemblyai.com/v2/upload',
        expect.any(Object)
      )
    })
  })

  describe('processFile', () => {
    it('should process file and return transcription result', async () => {
      // Mock uploadFile
      const mockUploadUrl = 'https://example.com/upload'
      jest.spyOn(TranscriptionService, 'uploadFile').mockResolvedValue(mockUploadUrl)

      // Mock AssemblyAI transcribe response
      const mockTranscribeResponse = {
        id: 'test-id',
        text: 'Test transcription',
        status: 'completed',
      }
      mockAssemblyAI.transcribe.mockResolvedValue(mockTranscribeResponse)

      // Mock OpenAI response
      const mockOpenAIResponse = {
        choices: [{ message: { content: 'Test summary' } }],
      }
      mockOpenAI.chat.completions.create.mockResolvedValue(mockOpenAIResponse)

      const buffer = Buffer.from('test audio content')
      const result = await TranscriptionService.processFile(buffer)

      expect(result).toEqual({
        id: 'test-id',
        text: 'Test transcription',
        status: 'completed',
        summary: 'Test summary',
        keyPoints: [],
        sentiment: '',
      })
      expect(TranscriptionService.uploadFile).toHaveBeenCalledWith(buffer)
      expect(mockAssemblyAI.transcribe).toHaveBeenCalled()
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled()
    })
  })

  describe('getStatus', () => {
    it('should return transcription status', async () => {
      const mockStatus = {
        id: 'test-id',
        status: 'completed',
        text: 'Test transcription',
      }
      mockAssemblyAI.transcript.get.mockResolvedValue(mockStatus)

      const result = await TranscriptionService.getStatus('test-id')

      expect(result).toEqual({
        id: 'test-id',
        text: 'Test transcription',
        status: 'completed',
        summary: '',
        keyPoints: [],
        sentiment: '',
      })
      expect(mockAssemblyAI.transcript.get).toHaveBeenCalledWith('test-id')
    })
  })
})
