import { NextResponse } from 'next/server';
import { assemblyClient, MAX_FILE_SIZE, SUPPORTED_AUDIO_TYPES } from '@/lib/api';
import { TranscriptionResponse } from '@/types/transcription';

export async function POST(request: Request) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload an audio file.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 80MB limit' },
        { status: 400 }
      );
    }

    // Convert File to Buffer with error handling
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Buffer conversion error:', error);
      return NextResponse.json(
        { error: 'Failed to process file' },
        { status: 500 }
      );
    }

    // Upload file to AssemblyAI with retries
    let uploadResponse;
    let retries = 3;
    while (retries > 0) {
      try {
        uploadResponse = await assemblyClient.files.upload(buffer, {
          fileName: file.name,
          mimeType: file.type
        });
        break;
      } catch (error) {
        console.error(`Upload attempt ${4 - retries} failed:`, error);
        retries--;
        if (retries === 0) {
          return NextResponse.json(
            { error: 'Failed to upload file after multiple attempts' },
            { status: 500 }
          );
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!uploadResponse?.audio_url) {
      console.error('Upload response missing audio_url:', uploadResponse);
      return NextResponse.json(
        { error: 'Failed to get audio URL from upload' },
        { status: 500 }
      );
    }

    // Create transcription
    const transcript = await assemblyClient.transcripts.create({
      audio_url: uploadResponse.audio_url,
      language_code: 'en',
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/assemblyai`,
      webhook_auth_header: process.env.ASSEMBLYAI_WEBHOOK_AUTH_TOKEN
    });

    const response: TranscriptionResponse = {
      transcriptId: transcript.id,
      status: transcript.status
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'An error occurred during transcription' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { transcriptionId: string } }
) {
  try {
    const transcriptionId = params.transcriptionId;
    if (!transcriptionId) {
      return NextResponse.json(
        { error: 'No transcription ID provided' },
        { status: 400 }
      );
    }

    const result = await assemblyClient.transcripts.get(transcriptionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcription status' },
      { status: 500 }
    );
  }
}

// Set larger body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}
