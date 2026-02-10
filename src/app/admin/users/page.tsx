/**
 * Admin Users Page
 *
 * User management with filters and paginated table.
 */

'use client';

import { UsersTable } from '@/components/admin/users-table';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
      <UsersTable />
    </div>
  );
}
