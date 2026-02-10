/**
 * File Service Tests
 *
 * Tests file upload URL creation, download URL, deletion, and listing.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase
const mockInsert = vi.fn();
const mockSelectFiles = vi.fn();
const mockDeleteFiles = vi.fn();
const mockStorageUpload = vi.fn();
const mockStorageDownload = vi.fn();
const mockStorageRemove = vi.fn();

const createFilesChain = () => ({
  insert: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: mockInsert,
    }),
  }),
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: mockSelectFiles,
      }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
  delete: vi.fn().mockReturnValue({
    eq: mockDeleteFiles,
  }),
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: vi.fn(() => createFilesChain()),
    storage: {
      from: vi.fn(() => ({
        createSignedUploadUrl: mockStorageUpload,
        createSignedUrl: mockStorageDownload,
        remove: mockStorageRemove,
      })),
    },
  })),
}));

import {
  createUploadUrl,
  createDownloadUrl,
  deleteFile,
  listUserFiles,
} from '@/lib/services/file-service';

describe('file-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUploadUrl', () => {
    it('should return upload URL and file ID on success', async () => {
      mockInsert.mockResolvedValue({
        data: { id: 'file-1' },
        error: null,
      });
      mockStorageUpload.mockResolvedValue({
        data: { signedUrl: 'https://storage.example.com/upload' },
        error: null,
      });

      const result = await createUploadUrl('consultant-1', 'test.pdf', 'application/pdf', 1024);

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('fileId', 'file-1');
    });

    it('should return error when insert fails', async () => {
      mockInsert.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      const result = await createUploadUrl('consultant-1', 'test.pdf', 'application/pdf', 1024);

      expect(result).toHaveProperty('error');
    });
  });

  describe('createDownloadUrl', () => {
    it('should return download URL on success', async () => {
      mockSelectFiles.mockResolvedValue({
        data: { id: 'file-1', key: 'consultant-1/test.pdf' },
        error: null,
      });
      mockStorageDownload.mockResolvedValue({
        data: { signedUrl: 'https://storage.example.com/download' },
        error: null,
      });

      const result = await createDownloadUrl('consultant-1', 'file-1');

      expect(result).toHaveProperty('downloadUrl');
    });

    it('should return error when file not found', async () => {
      mockSelectFiles.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await createDownloadUrl('consultant-1', 'nonexistent');

      expect(result).toHaveProperty('error', 'Arquivo não encontrado');
    });
  });

  describe('deleteFile', () => {
    it('should delete file from storage and database', async () => {
      mockSelectFiles.mockResolvedValue({
        data: { id: 'file-1', key: 'consultant-1/test.pdf' },
        error: null,
      });
      mockStorageRemove.mockResolvedValue({ error: null });
      mockDeleteFiles.mockResolvedValue({ error: null });

      const result = await deleteFile('consultant-1', 'file-1');

      expect(result.success).toBe(true);
    });

    it('should return error when file not found', async () => {
      mockSelectFiles.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await deleteFile('consultant-1', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Arquivo não encontrado');
    });
  });

  describe('listUserFiles', () => {
    it('should return empty array when no files', async () => {
      const files = await listUserFiles('consultant-1');
      expect(files).toEqual([]);
    });
  });
});
