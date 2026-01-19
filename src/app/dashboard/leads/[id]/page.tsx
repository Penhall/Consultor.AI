import { headers } from 'next/headers'
import { LeadDetail } from '@/components/leads/lead-detail'
import type { Database } from '@/types/database'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'

type Lead = Database['public']['Tables']['leads']['Row']

async function loadLead(id: string): Promise<Lead | null> {
  const cookie = headers().get('cookie') || ''
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(new URL(`/api/leads/${id}`, baseUrl), {
    headers: { cookie },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.data ?? null
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await loadLead(params.id)

  if (!lead) {
    return (
      <Alert className="m-8 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <AlertDescription className="text-red-800 dark:text-red-200">
          Lead não encontrado ou você não tem acesso.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardContent className="p-6">
          <LeadDetail lead={lead} />
        </CardContent>
      </Card>
    </div>
  )
}
