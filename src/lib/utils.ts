import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SUPPORTED_AUDIO_TYPES, MAX_FILE_SIZE } from './api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAudioFile(file: File): FileValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided'
    };
  }

  if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Unsupported file type. Please upload an audio file.'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
