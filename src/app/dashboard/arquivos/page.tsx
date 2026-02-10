/**
 * File Upload Page
 *
 * Upload zone and file list for consultant marketing materials.
 */

'use client';

import { FileUploadZone } from '@/components/files/file-upload-zone';
import { FileList } from '@/components/files/file-list';

export default function ArquivosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Arquivos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie tabelas de preços, materiais de marketing e outros documentos.
        </p>
      </div>

      <FileUploadZone />
      <FileList />
    </div>
  );
}
