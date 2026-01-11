import Link from 'next/link';

export default function PerfilPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

      <div className="grid gap-6">
        {/* Informações Pessoais */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Nome</label>
              <p className="font-medium">Consultor Demo</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">demo@consultor.ai</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">WhatsApp</label>
              <p className="font-medium">+55 11 99988-7766</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Vertical</label>
              <p className="font-medium">Planos de Saúde</p>
            </div>
          </div>
        </div>

        {/* Integração WhatsApp */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Integração WhatsApp</h2>
            <Link
              href="/dashboard/perfil/whatsapp"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Gerenciar →
            </Link>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">WhatsApp não conectado</p>
                <p className="text-xs text-gray-500">
                  Configure sua integração com WhatsApp Business para começar a receber leads
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/perfil/whatsapp"
              className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Conectar WhatsApp Business
            </Link>
          </div>
        </div>

        {/* Plano e Assinatura */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Plano e Assinatura</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Plano Atual</label>
              <p className="font-medium text-lg">Pro</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                Ativo
              </span>
            </div>
            <div>
              <label className="text-sm text-gray-600">Limite de Leads/Mês</label>
              <p className="font-medium">200 leads</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Leads este mês</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '2.5%' }}></div>
                </div>
                <span className="text-sm font-medium">5 / 200</span>
              </div>
            </div>
          </div>
        </div>

        {/* Funcionalidades Futuras */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades em Desenvolvimento</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Editar informações pessoais</li>
            <li>Alterar senha</li>
            <li>Configurações de notificações</li>
            <li>Preferências de idioma e timezone</li>
            <li>Histórico de faturas</li>
            <li>Gerenciar métodos de pagamento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
