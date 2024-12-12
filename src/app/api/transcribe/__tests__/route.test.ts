import { POST, GET } from '../route'
import { TranscriptionService } from '@/lib/transcription-service'
import { NextResponse } from 'next/server'

jest.mock('@/lib/transcription-service')

describe('transcribe API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/transcribe', () => {
    it('should handle file upload and start transcription', async () => {
      // Mock FormData with audio file
      const formData = new FormData()
      const file = new File(['test audio content'], 'test.mp3', { type: 'audio/mpeg' })
      formData.append('file', file)

      // Mock TranscriptionService.processFile
      const mockResult = {
        id: 'test-id',
        status: 'processing',
        text: '',
        summary: '',
        keyPoints: [],
        sentiment: '',
      }
      jest.spyOn(TranscriptionService, 'processFile').mockResolvedValue(mockResult)

      // Create request with FormData
      const request = new Request('http://localhost:3000/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
      expect(TranscriptionService.processFile).toHaveBeenCalled()
    })

    it('should handle errors during file processing', async () => {
      // Mock FormData with invalid file
      const formData = new FormData()
      const file = new File(['invalid content'], 'test.txt', { type: 'text/plain' })
      formData.append('file', file)

      // Mock TranscriptionService.processFile to throw error
      jest.spyOn(TranscriptionService, 'processFile').mockRejectedValue(new Error('Invalid file type'))

      // Create request with FormData
      const request = new Request('http://localhost:3000/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid file type',
      })
    })
  })

  describe('GET /api/transcribe', () => {
    it('should retrieve transcription status', async () => {
      // Mock TranscriptionService.getStatus
      const mockStatus = {
        id: 'test-id',
        status: 'completed',
        text: 'Test transcription',
        summary: 'Test summary',
        keyPoints: [],
        sentiment: 'positive',
      }
      jest.spyOn(TranscriptionService, 'getStatus').mockResolvedValue(mockStatus)

      // Create request with transcriptionId
      const url = new URL('http://localhost:3000/api/transcribe')
      url.searchParams.append('transcriptionId', 'test-id')
      const request = new Request(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
      expect(data).toEqual(mockStatus)
      expect(TranscriptionService.getStatus).toHaveBeenCalledWith('test-id')
    })

    it('should handle missing transcriptionId', async () => {
      // Create request without transcriptionId
      const request = new Request('http://localhost:3000/api/transcribe')

      const response = await GET(request)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Missing transcriptionId parameter',
      })
    })

    it('should handle errors during status retrieval', async () => {
      // Mock TranscriptionService.getStatus to throw error
      jest.spyOn(TranscriptionService, 'getStatus').mockRejectedValue(new Error('Status not found'))

      // Create request with invalid transcriptionId
      const url = new URL('http://localhost:3000/api/transcribe')
      url.searchParams.append('transcriptionId', 'invalid-id')
      const request = new Request(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(404)
      expect(data).toEqual({
        error: 'Status not found',
      })
    })
  })
})
