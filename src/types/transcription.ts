export interface TranscriptionStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
}

export interface TranscriptionResponse {
  transcriptId: string;
  status: string;
  error?: string;
}

export interface WebhookPayload {
  transcript_id: string;
  status: string;
  text?: string;
  error?: string;
  audio_url: string;
  webhook_auth_token?: string;
  webhook_status_code?: number;
}
