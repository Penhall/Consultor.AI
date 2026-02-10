/**
 * File Upload Zone Component
 *
 * Drag & drop area with file type validation and upload progress.
 */

'use client';

import { useCallback, useState, useRef } from 'react';
import { useUploadFile } from '@/hooks/useFiles';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
} from '@/lib/validations/file';

export function FileUploadZone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
      return 'Tipo de arquivo não permitido. Use PDF, PNG, JPG ou WEBP.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_LABEL}.`;
    }
    return null;
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0] as File | undefined;
      if (!file) return;

      const error = validateFile(file);

      if (error) {
        setValidationError(error);
        return;
      }

      setValidationError(null);
      uploadFile.mutate(file);
    },
    [validateFile, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <svg
          className="mb-2 h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        {uploadFile.isPending ? (
          <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
        ) : (
          <>
            <p className="text-sm font-medium">Arraste um arquivo ou clique para selecionar</p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, PNG, JPG ou WEBP (máx. {MAX_FILE_SIZE_LABEL})
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={e => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {validationError && <p className="text-sm text-destructive">{validationError}</p>}

      {uploadFile.isError && (
        <p className="text-sm text-destructive">
          {uploadFile.error?.message || 'Erro ao enviar arquivo'}
        </p>
      )}

      {uploadFile.isSuccess && (
        <p className="text-sm text-green-600">Arquivo enviado com sucesso!</p>
      )}
    </div>
  );
}
