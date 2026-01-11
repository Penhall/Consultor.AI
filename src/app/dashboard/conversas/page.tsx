export default function ConversasPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Conversas</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Página de gerenciamento de conversas em desenvolvimento.
        </p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades Planejadas:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Histórico completo de conversas</li>
            <li>Filtros por status (ativa, completa, abandonada)</li>
            <li>Visualização do fluxo conversacional</li>
            <li>Estatísticas de conclusão</li>
            <li>Análise de respostas</li>
            <li>Exportação de transcrições</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded border border-green-200">
          <p className="text-sm text-green-800">
            💬 <strong>Teste conversas:</strong> Use o simulador de WhatsApp para iniciar uma conversa de teste
            <a href="/dashboard/test/whatsapp-simulator" className="text-green-600 underline ml-1">
              Abrir simulador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
