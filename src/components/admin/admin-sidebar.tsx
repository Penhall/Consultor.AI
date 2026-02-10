/**
 * Admin Sidebar Component
 *
 * Navigation links for admin panel sections.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Usuários' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 space-y-1 border-r bg-card p-4">
      <h2 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Admin
      </h2>
      {ADMIN_LINKS.map(link => {
        const isActive =
          link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {link.label}
          </Link>
        );
      })}

      <div className="mt-8 border-t pt-4">
        <Link
          href="/dashboard"
          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </nav>
  );
}
