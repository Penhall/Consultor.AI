'use client'

import { useState } from 'react'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Clock,
  Plus,
  Check,
  X,
  Bell,
  Calendar,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FollowUp } from '@/lib/services/follow-up-service'

interface FollowUpCardProps {
  leadId: string
  followUps: FollowUp[]
  loading?: boolean
  onRefresh: () => void
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
  completed: { label: 'Concluido', color: 'bg-green-100 text-green-800', icon: Check },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: X },
}

function FollowUpItem({
  followUp,
  onComplete,
  onCancel,
}: {
  followUp: FollowUp
  onComplete: () => void
  onCancel: () => void
}) {
  const config = statusConfig[followUp.status] || statusConfig.pending
  const Icon = config.icon
  const isOverdue = followUp.status === 'pending' && isPast(new Date(followUp.scheduled_at))

  return (
    <div
      className={cn(
        'border rounded-lg p-3 space-y-2',
        isOverdue && 'border-red-300 bg-red-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <Icon className={cn('h-4 w-4 mt-0.5', isOverdue ? 'text-red-500' : 'text-gray-400')} />
          <div>
            <p className="font-medium text-sm">{followUp.title}</p>
            {followUp.message && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{followUp.message}</p>
            )}
          </div>
        </div>
        <Badge className={cn('text-xs', config.color)}>{config.label}</Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {format(new Date(followUp.scheduled_at), "dd/MM 'as' HH:mm", { locale: ptBR })}
          </span>
        </div>
        {isOverdue && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>Atrasado</span>
          </div>
        )}
        {followUp.is_automatic && (
          <Badge variant="outline" className="text-[10px] py-0 h-4">
            Automatico
          </Badge>
        )}
      </div>

      {followUp.status === 'pending' && (
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onComplete}>
            <Check className="h-3 w-3 mr-1" />
            Concluir
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-gray-500"
            onClick={onCancel}
          >
            <X className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}

export function FollowUpCard({ leadId, followUps, loading, onRefresh }: FollowUpCardProps) {
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    scheduled_at: '',
  })

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending')
  const completedFollowUps = followUps.filter((f) => f.status !== 'pending')

  const handleCreate = async () => {
    if (!formData.title || !formData.scheduled_at) return

    setCreating(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({ title: '', message: '', scheduled_at: '' })
        setShowForm(false)
        onRefresh()
      }
    } finally {
      setCreating(false)
    }
  }

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    if (res.ok) onRefresh()
  }

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    if (res.ok) onRefresh()
  }

  // Default scheduled time: tomorrow at 10:00
  const getDefaultScheduledAt = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    return tomorrow.toISOString().slice(0, 16)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Follow-ups
            {pendingFollowUps.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingFollowUps.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                scheduled_at: getDefaultScheduledAt(),
              }))
              setShowForm(!showForm)
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Novo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Form */}
        {showForm && (
          <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="fu-title" className="text-xs">
                Titulo
              </Label>
              <Input
                id="fu-title"
                placeholder="Ex: Ligar para confirmar interesse"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu-message" className="text-xs">
                Mensagem (opcional)
              </Label>
              <Input
                id="fu-message"
                placeholder="Mensagem para enviar ao lead"
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu-date" className="text-xs">
                Agendar para
              </Label>
              <Input
                id="fu-date"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }))
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-7" onClick={handleCreate} disabled={creating}>
                {creating ? 'Criando...' : 'Criar'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Pending Follow-ups */}
        {pendingFollowUps.length > 0 && (
          <div className="space-y-2">
            {pendingFollowUps.map((followUp) => (
              <FollowUpItem
                key={followUp.id}
                followUp={followUp}
                onComplete={() => handleComplete(followUp.id)}
                onCancel={() => handleCancel(followUp.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {followUps.length === 0 && !showForm && (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhum follow-up agendado
          </p>
        )}

        {/* Completed Follow-ups (collapsed) */}
        {completedFollowUps.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              {completedFollowUps.length} follow-up(s) anteriores
            </summary>
            <div className="mt-2 space-y-2">
              {completedFollowUps.slice(0, 5).map((followUp) => (
                <div key={followUp.id} className="text-gray-400 flex items-center gap-2">
                  {followUp.status === 'completed' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  <span className="line-through">{followUp.title}</span>
                  <span>
                    -{' '}
                    {followUp.completed_at || followUp.cancelled_at
                      ? formatDistanceToNow(
                          new Date(followUp.completed_at || followUp.cancelled_at || ''),
                          { addSuffix: true, locale: ptBR }
                        )
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
