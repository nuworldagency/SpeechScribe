'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { validateAudioFile, formatFileSize } from '@/lib/utils';
import TranscriptionStatus from './TranscriptionStatus';

export default function FileUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setTranscriptId(null);
    setTranscriptionText(null);

    // Validate file
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      setIsProcessing(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload file
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      
      if (!data.transcriptId) {
        throw new Error('No transcription ID received');
      }

      setTranscriptId(data.transcriptId);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleTranscriptionComplete = useCallback((text: string) => {
    setTranscriptionText(text);
  }, []);

  const handleTranscriptionError = useCallback((error: string) => {
    setError(error);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer?.files[0];
    if (!file) return;

    // Create a new FileList-like object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    // Update the file input's files
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      // Trigger the change event
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div 
          className="flex items-center justify-center w-full"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ArrowUpTrayIcon className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                MP3, WAV, M4A (max. 80MB)
              </p>
              {isProcessing && (
                <div className="mt-4 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-sm text-gray-600">Processing...</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </label>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {transcriptId && (
          <TranscriptionStatus
            transcriptId={transcriptId}
            onComplete={handleTranscriptionComplete}
            onError={handleTranscriptionError}
          />
        )}

        {transcriptionText && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Transcription</h3>
            <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{transcriptionText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
