"use client"

import { useEffect, useState } from 'react'
import type { Database } from '@/types/database'
import { LeadList } from '@/components/leads/lead-list'
import { LeadDetail } from '@/components/leads/lead-detail'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, RefreshCw } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leads', { credentials: 'include' })
      if (!res.ok) throw new Error('Falha ao carregar leads')
      const data = await res.json()
      const items: Lead[] = data?.data ?? []
      setLeads(items)
      if (items.length > 0 && items[0]) setSelectedLead(items[0])
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar os leads.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchLeads()
  }, [])

  const handleStatusChange = async (status: Lead['status']) => {
    if (!selectedLead) return
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar status')
      setLeads((prev) =>
        prev.map((lead) => (lead.id === selectedLead.id ? { ...lead, status } : lead))
      )
      setSelectedLead((prev) => (prev ? { ...prev, status } : prev))
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar status do lead.')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch('/api/leads/export', { credentials: 'include' })
      if (!res.ok) throw new Error('Falha ao exportar leads')

      // Get the blob and create download link
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error(err)
      setError('Nao foi possivel exportar os leads.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Leads</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie e avance seus leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exporting || leads.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button variant="outline" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6 text-gray-600 dark:text-gray-300">Carregando...</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <LeadList leads={leads} onSelect={setSelectedLead} />
          </div>
          <div className="xl:col-span-1">
            {selectedLead ? (
              <LeadDetail lead={selectedLead} onStatusChange={handleStatusChange} />
            ) : (
              <Card>
                <CardContent className="p-6 text-gray-600 dark:text-gray-300">
                  Selecione um lead para ver detalhes.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
