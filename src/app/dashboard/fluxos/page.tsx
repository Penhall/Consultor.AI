export default function FluxosPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Fluxos Conversacionais</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Gerencie os fluxos de conversa do seu assistente de WhatsApp.
        </p>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Fluxo Padrão Ativo:</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">Qualificação de Plano de Saúde</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Fluxo padrão para qualificação de leads de planos de saúde
                </p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Ativo
              </span>
            </div>

            <div className="mt-4 text-sm">
              <p className="text-gray-700"><strong>Etapas:</strong> 7 passos</p>
              <p className="text-gray-700"><strong>Perguntas:</strong> Perfil → Idade → Coparticipação</p>
              <p className="text-gray-700"><strong>Ação final:</strong> Geração de resposta com IA</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades Planejadas:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Editor visual de fluxos (drag & drop)</li>
            <li>Criar múltiplos fluxos personalizados</li>
            <li>Testes de fluxos antes de publicar</li>
            <li>Análise de performance por fluxo</li>
            <li>Importar/exportar fluxos (JSON)</li>
            <li>Biblioteca de templates de fluxos</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-purple-50 rounded border border-purple-200">
          <p className="text-sm text-purple-800">
            🔧 <strong>Personalização:</strong> Os fluxos são definidos em JSON e podem ser editados diretamente no banco de dados via Supabase Studio
          </p>
        </div>
      </div>
    </div>
  );
}
