'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MessageSquare,
  Bot,
  User,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
} from 'lucide-react'
import type { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']

type ConversationWithMessages = Conversation & {
  messages: Message[]
}

interface ConversationTimelineProps {
  conversations: ConversationWithMessages[]
  loading?: boolean
}

const statusConfig = {
  active: { label: 'Ativa', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Finalizada', color: 'bg-blue-100 text-blue-800' },
  abandoned: { label: 'Abandonada', color: 'bg-gray-100 text-gray-800' },
  paused: { label: 'Pausada', color: 'bg-yellow-100 text-yellow-800' },
}

const messageStatusIcon = {
  pending: <Clock className="h-3 w-3 text-gray-400" />,
  sent: <Check className="h-3 w-3 text-gray-400" />,
  delivered: <CheckCheck className="h-3 w-3 text-gray-400" />,
  read: <CheckCheck className="h-3 w-3 text-blue-500" />,
  failed: <AlertCircle className="h-3 w-3 text-red-500" />,
}

function MessageBubble({ message }: { message: Message }) {
  const isOutbound = message.direction === 'outbound'
  const statusIcon = messageStatusIcon[message.status as keyof typeof messageStatusIcon]

  return (
    <div
      className={cn(
        'flex gap-2 max-w-[85%]',
        isOutbound ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isOutbound
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-200 text-gray-600'
        )}
      >
        {isOutbound ? (
          message.is_ai_generated ? (
            <Bot className="h-4 w-4" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          'rounded-lg px-4 py-2 text-sm',
          isOutbound
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-100 text-gray-900'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isOutbound ? 'text-primary-foreground/70' : 'text-gray-500'
          )}
        >
          <span>
            {message.created_at &&
              formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
          </span>
          {isOutbound && statusIcon}
          {message.is_ai_generated && (
            <Badge variant="outline" className="ml-1 text-[10px] py-0 h-4">
              IA
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

function ConversationCard({
  conversation,
}: {
  conversation: ConversationWithMessages
}) {
  const config = statusConfig[conversation.status as keyof typeof statusConfig] || statusConfig.active
  const hasMessages = conversation.messages && conversation.messages.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversa
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', config.color)}>{config.label}</Badge>
            {conversation.completion_percentage !== null && (
              <Badge variant="outline" className="text-xs">
                {conversation.completion_percentage}% completo
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Iniciada{' '}
          {conversation.created_at &&
            formatDistanceToNow(new Date(conversation.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          {conversation.message_count && (
            <span> - {conversation.message_count} mensagens</span>
          )}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {hasMessages ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma mensagem nesta conversa
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function ConversationTimeline({
  conversations,
  loading,
}: ConversationTimelineProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Nenhuma conversa registrada para este lead
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Conversas ({conversations.length})
      </h3>
      {conversations.map((conversation) => (
        <ConversationCard key={conversation.id} conversation={conversation} />
      ))}
    </div>
  )
}
