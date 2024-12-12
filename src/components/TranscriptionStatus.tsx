'use client';

import { useEffect, useState } from 'react';
import { TranscriptionStatus as Status } from '@/types/transcription';
import { cn } from '@/lib/utils';

interface TranscriptionStatusProps {
  transcriptId: string;
  onComplete?: (text: string) => void;
  onError?: (error: string) => void;
}

export default function TranscriptionStatus({
  transcriptId,
  onComplete,
  onError
}: TranscriptionStatusProps) {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/transcribe/${transcriptId}`);
        const data = await response.json();

        setStatus(data);

        if (data.status === 'completed' && data.text) {
          onComplete?.(data.text);
        } else if (data.status === 'error') {
          setError(data.error || 'An error occurred during transcription');
          onError?.(data.error || 'An error occurred during transcription');
        }
      } catch (err) {
        setError('Failed to fetch transcription status');
        onError?.('Failed to fetch transcription status');
      }
    };

    // Check status immediately and then every 2 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [transcriptId, onComplete, onError]);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mt-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const statusMessages = {
    queued: 'Queued for transcription...',
    processing: 'Processing audio...',
    completed: 'Transcription completed!',
    error: 'Error during transcription'
  };

  const statusColors = {
    queued: 'bg-gray-100 text-gray-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700'
  };

  if (!status) {
    return null;
  }

  return (
    <div className="mt-4">
      <div
        className={cn(
          'rounded-md px-4 py-2',
          statusColors[status.status as keyof typeof statusColors]
        )}
      >
        <p className="text-sm font-medium">
          {statusMessages[status.status as keyof typeof statusMessages]}
        </p>
      </div>
    </div>
  );
}
