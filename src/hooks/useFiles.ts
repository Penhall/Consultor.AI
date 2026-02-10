/**
 * File management hooks for upload, download, and deletion.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FileRecord } from '@/lib/services/file-service';
import type { ApiResponse } from '@/types/api';

export function useFileList() {
  return useQuery({
    queryKey: ['files'],
    queryFn: async (): Promise<FileRecord[]> => {
      const response = await fetch('/api/files');
      const data: ApiResponse<FileRecord[]> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar arquivos');
      }

      return data.data;
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get presigned URL
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          sizeBytes: file.size,
        }),
      });

      const data: ApiResponse<{ uploadUrl: string; fileId: string }> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao iniciar upload');
      }

      // Step 2: Upload to presigned URL
      const uploadResponse = await fetch(data.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro ao enviar arquivo');
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      const data: ApiResponse<{ deleted: true }> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao excluir arquivo');
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}
