import { redirect } from 'next/navigation';

/**
 * @deprecated Esta rota foi substituída por /dashboard/flows
 * Mantida apenas para compatibilidade com links antigos
 */
export default function FluxosRedirect() {
  redirect('/dashboard/flows');
}
