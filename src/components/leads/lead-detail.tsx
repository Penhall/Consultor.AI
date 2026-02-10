'use client'

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Database } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Edit2,
  Save,
  X,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Lead = Database['public']['Tables']['leads']['Row']

const statusOptions: Array<{
  value: Lead['status']
  label: string
  color: string
}> = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  { value: 'em_contato', label: 'Em contato', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'qualificado', label: 'Qualificado', color: 'bg-green-100 text-green-800' },
  { value: 'agendado', label: 'Agendado', color: 'bg-purple-100 text-purple-800' },
  { value: 'fechado', label: 'Fechado', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-100 text-red-800' },
]

interface LeadDetailProps {
  lead: Lead
  onStatusChange?: (status: Lead['status']) => Promise<void> | void
  onUpdate?: (data: Partial<Lead>) => Promise<void> | void
}

export function LeadDetail({ lead, onStatusChange, onUpdate }: LeadDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: lead.name || '',
    email: lead.email || '',
  })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleStatus = async (status: Lead['status']) => {
    if (status === lead.status) return
    await onStatusChange?.(status)
  }

  const handleSave = async () => {
    if (!onUpdate) return
    setSaving(true)
    try {
      await onUpdate({
        name: editData.name || null,
        email: editData.email || null,
      })
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: lead.name || '',
      email: lead.email || '',
    })
    setIsEditing(false)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const defaultStatus = { value: 'novo' as const, label: 'Novo', color: 'bg-blue-100 text-blue-800' }
  const currentStatus = statusOptions.find((s) => s.value === lead.status) ?? defaultStatus
  const metadata = lead.metadata as Record<string, unknown> | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {lead.name || 'Lead sem nome'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={cn('text-xs', currentStatus.color)}>
              {currentStatus.label}
            </Badge>
            {lead.score !== null && (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Score: {lead.score}
              </Badge>
            )}
          </div>
        </div>
        {onUpdate && (
          <Button
            variant={isEditing ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-1" />
                Editar
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Informacoes de contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Nome do lead"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">WhatsApp</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{lead.whatsapp_number}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(lead.whatsapp_number)}
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <a
                        href={`https://wa.me/${lead.whatsapp_number.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {lead.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium truncate">{lead.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Criado em</p>
                    <p className="font-medium">
                      {lead.created_at
                        ? format(new Date(lead.created_at), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })
                        : '-'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {lead.created_at &&
                        formatDistanceToNow(new Date(lead.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                    </p>
                  </div>
                </div>

                {lead.last_contacted_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Ultimo contato</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(lead.last_contacted_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status do lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={option.value === lead.status ? 'default' : 'outline'}
                className={cn(
                  'w-full justify-start',
                  option.value === lead.status && option.color
                )}
                onClick={() => handleStatus(option.value)}
                disabled={!onStatusChange}
              >
                {option.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Qualification Data */}
      {metadata && Object.keys(metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Dados de qualificacao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(metadata).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
                >
                  <p className="text-xs text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="font-medium text-sm mt-1">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Info */}
      {(lead.source || lead.utm_source) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Origem do lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lead.source && (
                <Badge variant="outline">Fonte: {lead.source}</Badge>
              )}
              {lead.utm_source && (
                <Badge variant="outline">UTM Source: {lead.utm_source}</Badge>
              )}
              {lead.utm_medium && (
                <Badge variant="outline">UTM Medium: {lead.utm_medium}</Badge>
              )}
              {lead.utm_campaign && (
                <Badge variant="outline">UTM Campaign: {lead.utm_campaign}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
