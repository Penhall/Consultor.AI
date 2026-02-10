'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LeadDetail } from '@/components/leads/lead-detail'
import { ConversationTimeline } from '@/components/leads/conversation-timeline'
import { FollowUpCard } from '@/components/leads/follow-up-card'
import type { Database } from '@/types/database'
import type { FollowUp } from '@/lib/services/follow-up-service'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type Message = Database['public']['Tables']['messages']['Row']

type ConversationWithMessages = Conversation & {
  messages: Message[]
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [followUpsLoading, setFollowUpsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${params.id}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Lead nao encontrado')
        } else {
          setError('Erro ao carregar lead')
        }
        return
      }
      const data = await res.json()
      setLead(data?.data ?? null)
      setError(null)
    } catch {
      setError('Erro ao carregar lead')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true)
    try {
      const res = await fetch(`/api/leads/${params.id}/conversations`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data?.data ?? [])
      }
    } catch {
      // Conversations are optional, don't show error
    } finally {
      setConversationsLoading(false)
    }
  }, [params.id])

  const loadFollowUps = useCallback(async () => {
    setFollowUpsLoading(true)
    try {
      const res = await fetch(`/api/leads/${params.id}/follow-ups`)
      if (res.ok) {
        const data = await res.json()
        setFollowUps(data?.data ?? [])
      }
    } catch {
      // Follow-ups are optional, don't show error
    } finally {
      setFollowUpsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    loadLead()
    loadConversations()
    loadFollowUps()
  }, [loadLead, loadConversations, loadFollowUps])

  const handleStatusChange = async (status: Lead['status']) => {
    if (!lead) return
    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setLead(data?.data ?? lead)
      }
    } catch {
      // Silent fail, user will see status didn't change
    }
  }

  const handleUpdate = async (data: Partial<Lead>) => {
    if (!lead) return
    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        setLead(result?.data ?? lead)
      }
    } catch {
      // Silent fail
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este lead? Esta acao nao pode ser desfeita.')) {
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/dashboard/leads')
      }
    } catch {
      setDeleting(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    loadLead()
    loadConversations()
    loadFollowUps()
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="p-8">
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error || 'Lead nao encontrado ou voce nao tem acesso.'}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/dashboard/leads')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para leads
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/leads')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>

      {/* Lead Details */}
      <LeadDetail
        lead={lead}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdate}
      />

      {/* Follow-ups */}
      <FollowUpCard
        leadId={params.id}
        followUps={followUps}
        loading={followUpsLoading}
        onRefresh={loadFollowUps}
      />

      {/* Conversations */}
      <ConversationTimeline
        conversations={conversations}
        loading={conversationsLoading}
      />
    </div>
  )
}
