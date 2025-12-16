/**
 * Meta WhatsApp Webhook Handler
 * Receives and processes incoming WhatsApp messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai/gemini'
import { createMetaClientFromIntegration } from '@/lib/whatsapp/meta-client'
import {
  validateMetaSignature,
  extractMessageFromWebhook,
  isStatusUpdate,
} from '@/lib/whatsapp/webhook-validation'

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

    // Handle status updates (message delivered, read, etc)
    if (isStatusUpdate(payload)) {
      // TODO: Update message status in database
      return NextResponse.json({ success: true })
    }

    // Extract message
    const message = extractMessageFromWebhook(payload)

    if (!message || message.type !== 'text') {
      // Only handle text messages for now
      return NextResponse.json({ success: true })
    }

    // Get consultant's WhatsApp integration
    const supabase = createServiceClient()

    const { data: integration } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('consultant_id', consultantId)
      .eq('provider', 'meta')
      .eq('status', 'active')
      .single()

    if (!integration) {
      console.error('Integration not found for consultant:', consultantId)
      return NextResponse.json({ success: true }) // Don't fail, just ignore
    }

    // Get consultant data
    const { data: consultant } = await supabase
      .from('consultants')
      .select('name, business_name, vertical')
      .eq('id', consultantId)
      .single()

    // Save incoming message
    await supabase.from('messages').insert({
      consultant_id: consultantId,
      lead_phone: message.from,
      content: message.text,
      direction: 'inbound',
      platform_message_id: message.messageId,
      metadata: { timestamp: message.timestamp },
    })

    // Generate AI response
    const aiResponse = await generateAIResponse({
      consultantId,
      leadMessage: message.text || '',
      leadPhone: message.from,
      consultantData: consultant || undefined,
    })

    // Send response via WhatsApp
    const whatsappClient = await createMetaClientFromIntegration(integration)
    const { messageId } = await whatsappClient.sendTextMessage(
      message.from,
      aiResponse
    )

    // Save outbound message
    await supabase.from('messages').insert({
      consultant_id: consultantId,
      lead_phone: message.from,
      content: aiResponse,
      direction: 'outbound',
      platform_message_id: messageId,
    })

    // Mark incoming message as read
    await whatsappClient.markAsRead(message.messageId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    // Return 200 to prevent Meta from retrying
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
