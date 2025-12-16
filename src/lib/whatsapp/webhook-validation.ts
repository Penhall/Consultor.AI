/**
 * WhatsApp Webhook Validation
 * Validates webhook signatures from Meta
 */

import { createHmac } from 'crypto'

/**
 * Validates Meta webhook signature (HMAC SHA256)
 * 
 * @param signature - X-Hub-Signature-256 header value
 * @param payload - Raw request body as string
 * @param appSecret - Meta App Secret
 * @returns True if signature is valid
 */
export function validateMetaSignature(
  signature: string | null,
  payload: string,
  appSecret: string
): boolean {
  if (!signature) {
    return false
  }

  try {
    // Meta sends signature in format: sha256=<hash>
    const signatureHash = signature.replace('sha256=', '')

    // Calculate expected signature
    const hmac = createHmac('sha256', appSecret)
    const expectedHash = hmac.update(payload).digest('hex')

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(signatureHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    )
  } catch (error) {
    console.error('Error validating webhook signature:', error)
    return false
  }
}

/**
 * Timing-safe comparison of two buffers
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }

  return result === 0
}

/**
 * Extracts message from Meta webhook payload
 */
export interface ExtractedMessage {
  messageId: string
  from: string // Phone number
  timestamp: string
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contacts'
  text?: string
  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  documentUrl?: string
  caption?: string
}

export function extractMessageFromWebhook(payload: any): ExtractedMessage | null {
  try {
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (!value?.messages || value.messages.length === 0) {
      return null // Not a message event
    }

    const message = value.messages[0]

    const extracted: ExtractedMessage = {
      messageId: message.id,
      from: message.from,
      timestamp: message.timestamp,
      type: message.type,
    }

    // Extract content based on type
    switch (message.type) {
      case 'text':
        extracted.text = message.text?.body
        break

      case 'image':
        extracted.imageUrl = message.image?.id // Will need to download later
        extracted.caption = message.image?.caption
        break

      case 'audio':
        extracted.audioUrl = message.audio?.id
        break

      case 'video':
        extracted.videoUrl = message.video?.id
        extracted.caption = message.video?.caption
        break

      case 'document':
        extracted.documentUrl = message.document?.id
        extracted.caption = message.document?.caption
        break
    }

    return extracted
  } catch (error) {
    console.error('Error extracting message from webhook:', error)
    return null
  }
}

/**
 * Checks if webhook payload is a status update
 */
export function isStatusUpdate(payload: any): boolean {
  const entry = payload.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value

  return Boolean(value?.statuses && value.statuses.length > 0)
}

/**
 * Extracts status update from webhook
 */
export interface MessageStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  recipientId: string
  error?: {
    code: number
    title: string
  }
}

export function extractStatusFromWebhook(payload: any): MessageStatus | null {
  try {
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (!value?.statuses || value.statuses.length === 0) {
      return null
    }

    const status = value.statuses[0]

    return {
      messageId: status.id,
      status: status.status,
      timestamp: status.timestamp,
      recipientId: status.recipient_id,
      error: status.errors?.[0] ? {
        code: status.errors[0].code,
        title: status.errors[0].title,
      } : undefined,
    }
  } catch (error) {
    console.error('Error extracting status from webhook:', error)
    return null
  }
}
