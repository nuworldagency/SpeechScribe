import { AssemblyAI } from 'assemblyai';

if (!process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY) {
  throw new Error('NEXT_PUBLIC_ASSEMBLYAI_API_KEY is not set');
}

export const assemblyClient = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY
});

export const MAX_FILE_SIZE = 80 * 1024 * 1024; // 80MB
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/wav',
  'audio/mpeg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm'
];
