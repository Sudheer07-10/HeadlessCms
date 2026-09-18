import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY must be defined')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// We'll use a default bucket name or get it from env, since we removed AWS_S3_BUCKET
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'media'

export async function uploadBufferToSupabase(
  buffer: Buffer,
  fileName: string,
  folder?: string,
  mimeType?: string
) {
  const supabase = getSupabaseClient()
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(4).toString('hex')
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  let key = `${timestamp}-${randomString}-${safeFileName}`
  if (folder) {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
    key = `${cleanFolder}/${key}`
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(key, buffer, {
      contentType: mimeType || 'application/octet-stream',
      upsert: false
    })

  if (error) {
    console.error('Supabase upload failed:', error)
    throw new Error('Failed to upload file to Supabase Storage')
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(key)

  return {
    secure_url: publicUrlData.publicUrl,
    public_id: key,
    resource_type: mimeType?.startsWith('image/') ? 'image' : 'raw',
    format: fileName.split('.').pop() || '',
    bytes: buffer.byteLength,
  }
}

export async function deleteFromSupabase(publicId: string) {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([publicId])

  if (error) {
    console.error('Supabase delete request failed:', error)
    return null
  }
  
  return { result: 'ok' }
}

export async function createSupabaseFolder(folderPath: string) {
  // Supabase Storage implicitly creates folders based on paths.
  return { success: true, path: folderPath }
}
