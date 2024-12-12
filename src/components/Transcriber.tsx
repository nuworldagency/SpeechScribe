"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TranscriberProps {
  isDemo?: boolean;
}

export const Transcriber: React.FC<TranscriberProps> = ({ isDemo = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Reset states
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file to transcribe');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe file');
      }

      setResult(data);

      // If demo user got a successful result, show signup prompt
      if (isDemo && data.isDemo) {
        // The signup prompt is handled by the parent component
        console.log('Demo transcription completed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while transcribing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Audio File {isDemo && "(Demo)"}
          </label>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100"
          />
          {isDemo && (
            <p className="text-sm text-gray-500 mt-1">
              Try our service with a free demo transcription
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !file}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
            }`}
        >
          {isLoading ? 'Transcribing...' : 'Start Transcription'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Transcription Result</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{result.text}</p>
            {result.summary && (
              <>
                <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">Summary</h4>
                <p className="text-gray-700">{result.summary}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
