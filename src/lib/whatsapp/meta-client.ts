/**
 * Meta WhatsApp Cloud API Client
 * Handles sending messages via Meta's official API
 */

import { decrypt } from '@/lib/encryption'

const META_API_VERSION = 'v18.0'
const META_API_BASE_URL = 'https://graph.facebook.com'

export interface WhatsAppMessage {
  to: string // Phone number with country code (+5561999999999)
  type: 'text' | 'template' | 'image' | 'interactive'
  text?: {
    body: string
    preview_url?: boolean
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components?: any[]
  }
  image?: {
    link: string
    caption?: string
  }
  interactive?: {
    type: 'button' | 'list'
    body: {
      text: string
    }
    action: any
  }
}

export interface MetaClientConfig {
  phoneNumberId: string
  accessToken: string // Encrypted or plain
}

export class MetaWhatsAppClient {
  private phoneNumberId: string
  private accessToken: string

  constructor(config: MetaClientConfig) {
    this.phoneNumberId = config.phoneNumberId
    
    // Decrypt if encrypted
    try {
      this.accessToken = decrypt(config.accessToken)
    } catch {
      // If decryption fails, assume it's already plain text (for testing)
      this.accessToken = config.accessToken
    }
  }

  /**
   * Sends a text message
   */
  async sendTextMessage(to: string, text: string): Promise<{ messageId: string }> {
    const message: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'text',
      text: {
        body: text,
        preview_url: false,
      },
    }

    return this.sendMessage(message)
  }

  /**
   * Sends a template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    components?: any[]
  ): Promise<{ messageId: string }> {
    const message: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components,
      },
    }

    return this.sendMessage(message)
  }

  /**
   * Sends an image message
   */
  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ messageId: string }> {
    const message: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      },
    }

    return this.sendMessage(message)
  }

  /**
   * Generic send message method
   */
  private async sendMessage(message: WhatsAppMessage): Promise<{ messageId: string }> {
    const url = `${META_API_BASE_URL}/${META_API_VERSION}/${this.phoneNumberId}/messages`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          ...message,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          `Meta API error: ${error.error?.message || response.statusText}`
        )
      }

      const data = await response.json()

      return {
        messageId: data.messages[0].id,
      }
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      throw error
    }
  }

  /**
   * Marks a message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    const url = `${META_API_BASE_URL}/${META_API_VERSION}/${this.phoneNumberId}/messages`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to mark message as read:', error)
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  /**
   * Formats phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')

    // Add + if not present
    if (!phone.startsWith('+')) {
      cleaned = `${cleaned}`
    }

    return cleaned
  }

  /**
   * Sends an interactive button message
   */
  async sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: { id: string; title: string }[]
  ): Promise<{ messageId: string }> {
    const message: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: bodyText,
        },
        action: {
          buttons: buttons.map((btn) => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title.substring(0, 20), // Max 20 chars
            },
          })),
        },
      },
    }

    return this.sendMessage(message)
  }

  /**
   * Sends an interactive list message
   */
  async sendListMessage(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: {
      title: string
      rows: { id: string; title: string; description?: string }[]
    }[]
  ): Promise<{ messageId: string }> {
    const message: WhatsAppMessage = {
      to: this.formatPhoneNumber(to),
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: bodyText,
        },
        action: {
          button: buttonText,
          sections: sections.map((section) => ({
            title: section.title,
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row.title.substring(0, 24), // Max 24 chars
              description: row.description?.substring(0, 72), // Max 72 chars
            })),
          })),
        },
      },
    }

    return this.sendMessage(message)
  }

  /**
   * Gets phone number info (for validation)
   */
  async getPhoneNumberInfo(): Promise<any> {
    const url = `${META_API_BASE_URL}/${META_API_VERSION}/${this.phoneNumberId}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get phone number info')
      }

      return response.json()
    } catch (error) {
      console.error('Failed to get phone number info:', error)
      throw error
    }
  }
}

/**
 * Factory function to create Meta client from database integration
 */
export async function createMetaClientFromIntegration(
  integration: {
    phone_number_id: string | null
    access_token: string | null
  }
): Promise<MetaWhatsAppClient> {
  // Import decrypt function
  const { decrypt } = await import('@/lib/encryption')

  if (!integration.phone_number_id || !integration.access_token) {
    throw new Error('Invalid integration: missing phone_number_id or access_token')
  }

  // Decrypt access token
  const decryptedToken = decrypt(integration.access_token)

  return new MetaWhatsAppClient({
    phoneNumberId: integration.phone_number_id,
    accessToken: decryptedToken,
  })
}
