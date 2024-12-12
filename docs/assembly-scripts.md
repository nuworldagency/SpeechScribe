# AssemblyAI Integration Scripts

## Webhook Implementation

### 1. Create Webhook Endpoint

```typescript
// src/app/api/webhook/assemblyai/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const webhook_auth_header = headersList.get('webhook_auth_header');
    
    // Verify webhook authentication
    if (webhook_auth_header !== process.env.ASSEMBLYAI_WEBHOOK_AUTH_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized webhook request' },
        { status: 401 }
      );
    }

    const webhookData = await request.json();
    console.log('Received webhook data:', webhookData);

    // Handle different transcript statuses
    switch (webhookData.status) {
      case 'completed':
        // Handle successful transcription
        if (webhookData.text) {
          // Store or process the transcription text
          console.log('Transcription completed:', webhookData.text);
        }
        break;
      
      case 'error':
        // Handle transcription error
        console.error('Transcription failed:', webhookData.error);
        break;

      default:
        console.log('Received status update:', webhookData.status);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
```

### 2. Update Transcription Request

```typescript
// In your transcription API route
const transcript = await client.transcripts.create({
  audio_url: uploadResponse.audio_url,
  language_code: 'en',
  webhook_url: 'https://your-domain.com/api/webhook/assemblyai',
  webhook_auth_header: process.env.ASSEMBLYAI_WEBHOOK_AUTH_TOKEN
});
```

### 3. Environment Variables

Add these to your `.env.local`:
```bash
ASSEMBLYAI_WEBHOOK_AUTH_TOKEN=your-secure-random-token
```

### 4. Types for Webhook Payload

```typescript
// src/types/assemblyai.ts
interface WebhookPayload {
  transcript_id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
  audio_url: string;
  webhook_status_code: number;
  webhook_auth_header?: string;
}
```

## AssemblyAI Integration Guide

### Overview
This document outlines the implementation of audio transcription using the AssemblyAI SDK.

### Installation

```bash
npm install assemblyai
```

### Configuration

1. Set up environment variables:
```env
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_api_key
ASSEMBLYAI_WEBHOOK_AUTH_TOKEN=your_webhook_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Initialize the SDK:
```typescript
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY
});
```

### File Upload Process

1. Convert File to Buffer:
```typescript
const buffer = Buffer.from(await file.arrayBuffer());
```

2. Upload file to AssemblyAI:
```typescript
const uploadResponse = await client.files.upload(buffer, {
  fileName: file.name,
  mimeType: file.type
});
```

3. Create transcription:
```typescript
const transcript = await client.transcripts.create({
  audio_url: uploadResponse.audio_url,
  language_code: 'en',
  webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/assemblyai`,
  webhook_auth_header: process.env.ASSEMBLYAI_WEBHOOK_AUTH_TOKEN
});
```

### Error Handling

Common errors and their solutions:

1. "Failed to get audio URL from upload":
   - Ensure proper file conversion to Buffer
   - Verify file size limits (max 80MB)
   - Check API key permissions

2. Hydration errors:
   - Use proper client-side state management
   - Avoid mixing server and client rendering
   - Handle loading states appropriately

### Best Practices

1. File Validation:
```typescript
const SUPPORTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/wav',
  'audio/mpeg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm'
];

const MAX_FILE_SIZE = 80 * 1024 * 1024; // 80MB
```

2. Error Handling:
```typescript
try {
  const uploadResponse = await client.files.upload(buffer, {
    fileName: file.name,
    mimeType: file.type
  });
  
  if (!uploadResponse?.audio_url) {
    throw new Error('Failed to get audio URL from upload');
  }
} catch (error) {
  console.error('Upload error:', error);
  throw error;
}
```

3. Status Tracking:
```typescript
export type TranscriptionStatus = 'queued' | 'processing' | 'completed' | 'error';

interface TranscriptionResult {
  id: string;
  status: TranscriptionStatus;
  text?: string;
  error?: string;
}
```

## Usage Notes

1. Generate a secure random token for `ASSEMBLYAI_WEBHOOK_AUTH_TOKEN`
2. Update the `webhook_url` in the transcription request with your actual domain
3. Handle webhook deliveries appropriately based on your application needs
4. Implement retry logic for failed webhook deliveries
5. Consider storing transcription results in a database for persistence

## Error Handling

- Verify webhook authentication using the `webhook_auth_header`
- Log failed webhook deliveries for debugging
- Implement appropriate error responses
- Consider implementing a queue system for processing webhook payloads

## Security Considerations

1. Always use HTTPS for webhook endpoints
2. Validate webhook authentication headers
3. Implement rate limiting for webhook endpoints
4. Keep webhook auth tokens secure and rotate them periodically
5. Log suspicious webhook activities
