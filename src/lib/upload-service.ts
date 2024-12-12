import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export class UploadService {
  static async uploadAudioFile(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('audio-uploads')
      .upload(fileName, file)

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('audio-uploads')
      .getPublicUrl(fileName)

    return publicUrl
  }

  static async deleteAudioFile(fileName: string): Promise<void> {
    const { error } = await supabase.storage
      .from('audio-uploads')
      .remove([fileName])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  }
}
