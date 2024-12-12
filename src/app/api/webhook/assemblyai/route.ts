import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { WebhookPayload } from '@/types/transcription';

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const webhookAuthHeader = headersList.get('webhook_auth_header');
    
    // Verify webhook authentication
    if (webhookAuthHeader !== process.env.ASSEMBLYAI_WEBHOOK_AUTH_TOKEN) {
      console.error('Invalid webhook auth header received');
      return NextResponse.json(
        { error: 'Unauthorized webhook request' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const webhookData = await request.json() as WebhookPayload;
    
    // Handle different transcription statuses
    switch (webhookData.status) {
      case 'completed':
        if (webhookData.text) {
          console.log('Transcription completed for ID:', webhookData.transcript_id);
          // Here you would typically:
          // 1. Store the transcription in your database
          // 2. Notify the client through WebSocket/SSE
          // 3. Update any relevant application state
        }
        break;
      
      case 'error':
        console.error('Transcription failed:', {
          id: webhookData.transcript_id,
          error: webhookData.error
        });
        break;

      case 'processing':
        console.log('Processing transcript:', webhookData.transcript_id);
        break;

      default:
        console.log('Received status update:', {
          id: webhookData.transcript_id,
          status: webhookData.status
        });
    }

    return NextResponse.json({ 
      success: true,
      transcriptId: webhookData.transcript_id,
      status: webhookData.status
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
