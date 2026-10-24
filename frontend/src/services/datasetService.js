/**
 * NETPULSE - User Datasets & Storage Persistence Service
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

import { supabase, isSupabaseConfigured } from './supabase'

const STORAGE_BUCKET = 'network-datasets'
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ['text/csv', 'application/vnd.ms-excel', 'text/plain']

/**
 * Retrieves metadata for datasets uploaded by the current authenticated user.
 */
export async function fetchUserDatasets() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: 'Database unconfigured. Custom datasets unavailable.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: [], error: 'Authentication required to view custom datasets.' }
    }

    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err.message || 'Failed to fetch user datasets.' }
  }
}

/**
 * Uploads a custom CSV telemetry file to Supabase Storage and records metadata.
 */
export async function uploadDatasetFile({ file, name, description = '', recordCount = null }) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Database unconfigured. Cannot upload dataset.' }
  }

  if (!file) {
    return { data: null, error: 'No file supplied for upload.' }
  }

  // File size validation (5 MB limit)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { data: null, error: `File size exceeds 5 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB).` }
  }

  // File extension & type validation
  const isCsvExtension = file.name.toLowerCase().endsWith('.csv')
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.type) || file.type === ''
  if (!isCsvExtension && !isValidMime) {
    return { data: null, error: 'Invalid file format. Only CSV telemetry files (.csv) are supported.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: null, error: 'Authentication required. Sign in to upload custom datasets.' }
    }

    // Storage path: <user.id>/<timestamp>_<sanitized_filename>
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${user.id}/${Date.now()}_${sanitizedName}`

    // 1. Upload to Supabase Storage private bucket
    const { error: storageErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (storageErr) {
      return { data: null, error: `Storage upload failed: ${storageErr.message}` }
    }

    // 2. Record metadata in public.datasets table
    const datasetRecord = {
      user_id: user.id,
      name: name && name.trim() ? name.trim() : file.name,
      file_path: filePath,
      description: description ? description.trim() : null,
      record_count: recordCount ? parseInt(recordCount, 10) : null
    }

    const { data: dbData, error: dbErr } = await supabase
      .from('datasets')
      .insert([datasetRecord])
      .select()
      .single()

    if (dbErr) {
      // Clean up storage object if DB record insertion fails
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
      return { data: null, error: `Dataset metadata record failed: ${dbErr.message}` }
    }

    return { data: dbData, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Dataset upload failed.' }
  }
}

/**
 * Deletes a user dataset from both Storage and the database.
 */
export async function deleteUserDataset(datasetId, filePath) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database unconfigured.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { success: false, error: 'Authentication required.' }
    }

    // 1. Remove from Storage
    if (filePath) {
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
    }

    // 2. Remove from Datasets table
    const { error } = await supabase
      .from('datasets')
      .delete()
      .eq('id', datasetId)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err.message || 'Failed to delete dataset.' }
  }
}
