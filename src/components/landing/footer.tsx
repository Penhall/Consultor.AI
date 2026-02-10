/**
 * Footer Component
 *
 * Site footer with logo, links, and copyright.
 */

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">CA</span>
              </div>
              <span className="text-lg font-semibold text-white">Consultor.AI</span>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Assistente de vendas com IA para consultores de planos de saúde.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Produto</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/termos" className="hover:text-white">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-white">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Consultor.AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
