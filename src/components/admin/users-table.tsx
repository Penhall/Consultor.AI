/**
 * Users Table Component
 *
 * Paginated admin user table with email, plan, status, and admin toggle.
 */

'use client';

import { useAdminUsers } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

export function UsersTable() {
  const { consultant } = useAuth();
  const {
    data,
    isLoading,
    page,
    setPage,
    emailFilter,
    setEmailFilter,
    statusFilter,
    setStatusFilter,
    toggleAdmin,
  } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por email..."
          value={emailFilter}
          onChange={e => setEmailFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={statusFilter || ''}
          onChange={e => setStatusFilter(e.target.value || undefined)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="cancel_at_period_end">Cancelando</option>
          <option value="past_due">Pagamento pendente</option>
          <option value="deleted">Cancelado</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Plano</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => {
              const isSelf = user.id === consultant?.id;

              return (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.name || '—'}</td>
                  <td className="px-4 py-3 capitalize">{user.subscription_plan || 'freemium'}</td>
                  <td className="px-4 py-3">{user.subscription_status || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleAdmin.mutate({
                          userId: user.id,
                          isAdmin: !user.is_admin,
                        })
                      }
                      disabled={isSelf || toggleAdmin.isPending}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        user.is_admin
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      } ${isSelf ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
                      title={isSelf ? 'Não é possível alterar seu próprio status' : ''}
                    >
                      {user.is_admin ? 'Admin' : 'Usuário'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {pagination.total} usuário{pagination.total !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
