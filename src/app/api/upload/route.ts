import { NextRequest, NextResponse } from 'next/server';

// Increase body parser limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '75mb',
    },
  },
  maxDuration: 60, // Increase max execution time for large file uploads
};

export async function POST(request: NextRequest) {
  try {
    // Increase the maximum body size for this route
    const contentLength = request.headers.get('content-length');
    const maxSize = 75 * 1024 * 1024; // 75MB

    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      return NextResponse.json({ 
        error: 'File size exceeds 75MB limit' 
      }, { status: 413 }); // Payload Too Large
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Additional file size check
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 75MB limit' }, { status: 413 });
    }

    // Process the file (e.g., save to storage, transcribe, etc.)
    // Add your file handling logic here

    return NextResponse.json({ 
      message: 'File uploaded successfully', 
      fileName: file.name,
      fileSize: file.size 
    }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'File upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
