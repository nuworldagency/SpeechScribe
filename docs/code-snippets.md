# SpeechScribe3 Code Snippets

## AssemblyAI API Integration

### File Upload and Transcription
```typescript
const uploadResponse = await client.files.upload(buffer, {
  fileName: file.name,
  mimeType: file.type
});

const transcript = await client.transcripts.create({
  audio_url: uploadResponse.audio_url,
  language_code: 'en',
  webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/assemblyai`,
  webhook_auth_header: process.env.ASSEMBLYAI_WEBHOOK_AUTH_TOKEN
});
```

### Webhook Handler
```typescript
export async function POST(request: Request) {
  const webhookData = await request.json();
  
  switch (webhookData.status) {
    case 'completed':
      if (webhookData.text) {
        console.log('Transcription completed:', webhookData.text);
      }
      break;
    
    case 'error':
      console.error('Transcription failed:', webhookData.error);
      break;
  }
}
```

### File Upload Component
```typescript
const handleFileUpload = async (file: File) => {
  if (!file.type.startsWith('audio/')) {
    throw new Error('Please upload an audio file');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data;
};
```

## Environment Variables
Required environment variables:
```bash
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_api_key
ASSEMBLYAI_WEBHOOK_AUTH_TOKEN=your_webhook_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Important Constants
```typescript
const MAX_FILE_SIZE = 80 * 1024 * 1024; // 80MB limit
const SUPPORTED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/m4a'];
```
