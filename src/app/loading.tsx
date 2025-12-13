export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900"></div>
        <p className="text-lg text-slate-600">Carregando...</p>
      </div>
    </div>
  );
}
