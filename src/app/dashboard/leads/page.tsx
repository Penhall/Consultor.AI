export default function LeadsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Leads</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Página de gerenciamento de leads em desenvolvimento.
        </p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades Planejadas:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Listagem de todos os leads</li>
            <li>Filtros por status (novo, em contato, qualificado, fechado, perdido)</li>
            <li>Busca por nome, telefone ou email</li>
            <li>Exportação para CSV/Excel</li>
            <li>Detalhes de cada lead</li>
            <li>Histórico de interações</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Use o simulador de WhatsApp para criar leads de teste:
            <a href="/dashboard/test/whatsapp-simulator" className="text-blue-600 underline ml-1">
              Ir para simulador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
