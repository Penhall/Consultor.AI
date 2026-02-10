import Link from 'next/link';

export default function NotFound() {
  const quickLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      description: 'Voltar para o painel principal',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      href: '/dashboard/leads',
      label: 'Leads',
      description: 'Gerenciar seus leads',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      href: '/dashboard/integracoes',
      label: 'Integracoes',
      description: 'Conectar CRM',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
    },
    {
      href: '/',
      label: 'Pagina Inicial',
      description: 'Voltar ao site',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="select-none text-[180px] font-bold leading-none text-gray-200 dark:text-gray-800">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg
                  className="h-10 w-10 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Pagina nao encontrada
        </h1>
        <p className="mx-auto mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
          Desculpe, a pagina que voce esta procurando nao existe ou foi movida para outro endereco.
        </p>

        {/* Quick Links */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-blue-100 dark:bg-gray-700 dark:group-hover:bg-blue-900/30">
                <div className="text-gray-600 transition-colors group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">
                  {link.icon}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {link.label}
              </span>
              <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {link.description}
              </span>
            </Link>
          ))}
        </div>

        {/* Support */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Precisa de ajuda?{' '}
          <a
            href="mailto:suporte@consultor.ai"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
