/**
 * File List Component
 *
 * Table displaying user files with download and delete actions.
 */

'use client';

import { useFileList, useDeleteFile } from '@/hooks/useFiles';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function FileList() {
  const { data: files, isLoading, error } = useFileList();
  const deleteFile = useDeleteFile();

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`);
      const data = await response.json();

      if (data.success && data.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = fileName;
        link.click();
      }
    } catch {
      // Download error handled silently
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Erro ao carregar arquivos: {error.message}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nenhum arquivo enviado ainda
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nome</th>
            <th className="px-4 py-3 text-left font-medium">Tipo</th>
            <th className="px-4 py-3 text-left font-medium">Tamanho</th>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{file.name}</td>
              <td className="px-4 py-3 uppercase text-muted-foreground">
                {file.type.split('/')[1] || file.type}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatFileSize(file.sizeBytes)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(file.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleDownload(file.id, file.name)}
                    className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    Baixar
                  </button>
                  <button
                    onClick={() => deleteFile.mutate(file.id)}
                    disabled={deleteFile.isPending}
                    className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
