/**
 * Meta WhatsApp Webhook Handler
 * Receives and processes incoming WhatsApp messages via Flow Engine
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMetaClientFromIntegration } from '@/lib/whatsapp/meta-client'
import {
  validateMetaSignature,
  extractMessageFromWebhook,
  extractStatusFromWebhook,
  isStatusUpdate,
} from '@/lib/whatsapp/webhook-validation'
import {
  getOrCreateLead,
  getOrCreateConversation,
  extractContactName,
} from '@/lib/services/lead-auto-create'
import {
  startConversation,
  processMessage,
  type StepResult,
} from '@/lib/flow-engine'

// GET - Webhook verification (required by Meta)
export async function GET(
  req: NextRequest,
  { params }: { params: { consultantId: string } }
) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified for consultant:', params.consultantId)
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST - Receive messages
export async function POST(
  req: NextRequest,
  { params }: { params: { consultantId: string } }
) {
  try {
    const body = await req.text()
    const payload = JSON.parse(body)
    const consultantId = params.consultantId

    // Validate signature
    const signature = req.headers.get('x-hub-signature-256')
    const isValid = validateMetaSignature(
      signature,
      body,
      process.env.META_APP_SECRET!
    )

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const supabase = await createClient()

    // Handle status updates (message delivered, read, etc)
    if (isStatusUpdate(payload)) {
      const status = extractStatusFromWebhook(payload)
      if (status) {
        await (supabase as any)
          .from('messages')
          .update({
            status: status.status,
            metadata: { error: status.error },
          })
          .eq('whatsapp_message_id', status.messageId)
      }
      return NextResponse.json({ success: true })
    }

    // Extract message
    const message = extractMessageFromWebhook(payload)

    if (!message) {
      // Not a message event (could be status, etc)
      return NextResponse.json({ success: true })
    }

    // Only handle text and interactive messages
    if (message.type !== 'text' && message.type !== 'interactive') {
      console.log('Unsupported message type:', message.type)
      return NextResponse.json({ success: true })
    }

    // Get consultant's WhatsApp integration
    const { data: integration } = await (supabase as any)
      .from('whatsapp_integrations')
      .select('*')
      .eq('consultant_id', consultantId)
      .eq('provider', 'meta')
      .eq('status', 'active')
      .single()

    if (!integration) {
      console.error('Integration not found for consultant:', consultantId)
      return NextResponse.json({ success: true })
    }

    // Extract contact name from webhook
    const contactName = extractContactName(payload)

    // Get or create lead
    const leadResult = await getOrCreateLead(
      consultantId,
      message.from,
      contactName
    )

    if (!leadResult.success) {
      console.error('Failed to get/create lead:', leadResult.error)
      return NextResponse.json({ success: false }, { status: 200 })
    }

    const { lead, isNew: _isNewLead } = leadResult.data

    // Get consultant's default flow
    const { data: defaultFlow } = await (supabase as any)
      .from('flows')
      .select('id')
      .eq('consultant_id', consultantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!defaultFlow) {
      console.error('No active flow found for consultant:', consultantId)
      return NextResponse.json({ success: false }, { status: 200 })
    }

    // Get or create conversation
    const conversationResult = await getOrCreateConversation(
      lead.id,
      defaultFlow.id
    )

    if (!conversationResult.success) {
      console.error('Failed to get/create conversation:', conversationResult.error)
      return NextResponse.json({ success: false }, { status: 200 })
    }

    const { conversationId, isNew: isNewConversation } = conversationResult.data

    // Create WhatsApp client
    const whatsappClient = await createMetaClientFromIntegration(integration)

    let flowResponse: StepResult

    // Start or continue conversation
    if (isNewConversation || !conversationId) {
      // Start new conversation
      const startResult = await startConversation(lead.id, defaultFlow.id)

      if (!startResult.success) {
        console.error('Failed to start conversation:', startResult.error)
        return NextResponse.json({ success: false }, { status: 200 })
      }

      flowResponse = startResult.data.firstStep

      // Save the conversation ID for future use
      const newConversationId = startResult.data.conversationId

      // Save incoming message (first message from lead)
      await (supabase as any).from('messages').insert({
        conversation_id: newConversationId,
        direction: 'inbound',
        content: message.text || '',
        whatsapp_message_id: message.messageId,
        metadata: { timestamp: message.timestamp, type: message.type },
      })
    } else {
      // Continue existing conversation
      const processResult = await processMessage(
        conversationId,
        message.text || ''
      )

      if (!processResult.success) {
        console.error('Failed to process message:', processResult.error)
        return NextResponse.json({ success: false }, { status: 200 })
      }

      flowResponse = processResult.data.response

      // Save incoming message
      await (supabase as any).from('messages').insert({
        conversation_id: conversationId,
        direction: 'inbound',
        content: message.text || '',
        whatsapp_message_id: message.messageId,
        metadata: { timestamp: message.timestamp, type: message.type },
      })

      // Check if conversation is complete
      if (processResult.data.conversationComplete) {
        await (supabase as any)
          .from('conversations')
          .update({ status: 'completed' })
          .eq('id', conversationId)
      }
    }

    // Send response based on step type
    let sentMessageId: string
    let responseContent: string

    // Flow response should always be successful at this point
    if (!flowResponse.success) {
      console.error('Flow response failed:', flowResponse.error)
      return NextResponse.json({ success: false }, { status: 200 })
    }

    if (flowResponse.type === 'choice') {
      // Send interactive message (buttons or list)
      responseContent = flowResponse.question

      if (flowResponse.options.length <= 3) {
        // Use buttons for up to 3 options
        const { messageId } = await whatsappClient.sendButtonMessage(
          message.from,
          flowResponse.question,
          flowResponse.options.map((option) => ({
            id: option.value,
            title: option.text,
          }))
        )
        sentMessageId = messageId
      } else {
        // Use list for more than 3 options
        const { messageId } = await whatsappClient.sendListMessage(
          message.from,
          flowResponse.question,
          'Escolher opção',
          [
            {
              title: 'Opções',
              rows: flowResponse.options.map((option) => ({
                id: option.value,
                title: option.text,
              })),
            },
          ]
        )
        sentMessageId = messageId
      }
    } else if (flowResponse.type === 'message') {
      // Send text message
      responseContent = flowResponse.message
      const { messageId } = await whatsappClient.sendTextMessage(
        message.from,
        flowResponse.message
      )
      sentMessageId = messageId
    } else {
      // Action complete - send generic acknowledgment
      responseContent = 'Ação executada com sucesso.'
      const { messageId } = await whatsappClient.sendTextMessage(
        message.from,
        responseContent
      )
      sentMessageId = messageId
    }

    // Save outbound message
    await (supabase as any).from('messages').insert({
      conversation_id: conversationId || undefined,
      direction: 'outbound',
      content: responseContent,
      whatsapp_message_id: sentMessageId,
      metadata: { type: flowResponse.type },
    })

    // Mark incoming message as read
    await whatsappClient.markAsRead(message.messageId)

    // Log webhook event
    await (supabase as any).from('webhook_events').insert({
      consultant_id: consultantId,
      provider: 'meta',
      event_type: 'message.received',
      payload,
      processed: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)

    // Log failed webhook event
    try {
      const supabase = await createClient()
      await (supabase as any).from('webhook_events').insert({
        consultant_id: params.consultantId,
        provider: 'meta',
        event_type: 'message.received',
        payload: {},
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }

    // Return 200 to prevent Meta from retrying
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
