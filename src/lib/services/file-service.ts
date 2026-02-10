/**
 * File Service
 *
 * Handles file upload, download, deletion, and listing via Supabase Storage.
 */

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

const STORAGE_BUCKET = 'consultant-files';

type FileRow = Database['public']['Tables']['files']['Row'];

export interface FileRecord {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  storageKey: string;
  createdAt: string;
}

export async function createUploadUrl(
  consultantId: string,
  fileName: string,
  fileType: string,
  sizeBytes: number
): Promise<{ uploadUrl: string; fileId: string } | { error: string }> {
  const supabase = await createClient();

  const key = `${consultantId}/${Date.now()}-${fileName}`;

  // Insert file record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filesTable = supabase.from('files') as any;
  const { data: fileRecord, error: insertError } = await filesTable
    .insert({
      consultant_id: consultantId,
      name: fileName,
      type: fileType,
      size_bytes: sizeBytes,
      storage_key: key,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to insert file record:', insertError);
    return { error: 'Erro ao registrar arquivo' };
  }

  // Create signed upload URL
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(key);

  if (uploadError) {
    console.error('Failed to create upload URL:', uploadError);
    // Clean up the file record
    await filesTable.delete().eq('id', fileRecord.id);
    return { error: 'Erro ao gerar URL de upload' };
  }

  return {
    uploadUrl: uploadData.signedUrl,
    fileId: fileRecord.id,
  };
}

export async function createDownloadUrl(
  consultantId: string,
  fileId: string
): Promise<{ downloadUrl: string } | { error: string }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filesTable = supabase.from('files') as any;
  const { data: rawData, error: fetchError } = await filesTable
    .select()
    .eq('id', fileId)
    .eq('consultant_id', consultantId)
    .single();

  const file = rawData as FileRow | null;

  if (fetchError || !file) {
    return { error: 'Arquivo não encontrado' };
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(file.storage_key, 3600); // 1 hour expiry

  if (urlError) {
    console.error('Failed to create download URL:', urlError);
    return { error: 'Erro ao gerar URL de download' };
  }

  return { downloadUrl: urlData.signedUrl };
}

export async function deleteFile(
  consultantId: string,
  fileId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filesTable = supabase.from('files') as any;
  const { data: rawData, error: fetchError } = await filesTable
    .select()
    .eq('id', fileId)
    .eq('consultant_id', consultantId)
    .single();

  const file = rawData as FileRow | null;

  if (fetchError || !file) {
    return { success: false, error: 'Arquivo não encontrado' };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([file.storage_key]);

  if (storageError) {
    console.error('Failed to delete from storage:', storageError);
  }

  // Delete from database
  const { error: deleteError } = await filesTable.delete().eq('id', fileId);

  if (deleteError) {
    console.error('Failed to delete file record:', deleteError);
    return { success: false, error: 'Erro ao excluir arquivo' };
  }

  return { success: true };
}

export async function listUserFiles(consultantId: string): Promise<FileRecord[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filesTable = supabase.from('files') as any;
  const { data, error } = await filesTable
    .select()
    .eq('consultant_id', consultantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list files:', error);
    return [];
  }

  return (data ?? []).map((file: FileRow) => ({
    id: file.id,
    name: file.name,
    type: file.type,
    sizeBytes: file.size_bytes,
    storageKey: file.storage_key,
    createdAt: file.created_at,
  }));
}
