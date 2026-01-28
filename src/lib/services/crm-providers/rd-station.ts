/**
 * RD Station CRM Provider
 *
 * Implementation for RD Station Marketing/CRM API integration
 * API Documentation: https://developers.rdstation.com/
 */

import type { CRMProviderInterface } from '../crm-service';

const RD_STATION_API_BASE = 'https://api.rd.services';

/**
 * RD Station API response types
 */
interface RDStationAccountInfo {
  name: string;
}

interface RDStationContact {
  uuid: string;
  email: string;
  name?: string;
}

interface RDStationError {
  error_type: string;
  error_message: string;
}

/**
 * RD Station Provider Implementation
 */
const rdStationProvider: CRMProviderInterface = {
  /**
   * Test connection to RD Station API
   */
  async testConnection(apiKey: string): Promise<{ connected: boolean; accountName?: string }> {
    try {
      const response = await fetch(`${RD_STATION_API_BASE}/platform/account/info`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('RD Station connection test failed:', response.status);
        return { connected: false };
      }

      const data = (await response.json()) as RDStationAccountInfo;

      return {
        connected: true,
        accountName: data.name,
      };
    } catch (error) {
      console.error('RD Station connection error:', error);
      return { connected: false };
    }
  },

  /**
   * Create or update a lead in RD Station
   *
   * Uses the Conversions endpoint for lead data
   * Documentation: https://developers.rdstation.com/reference/conversoes
   */
  async createOrUpdateLead(
    apiKey: string,
    data: Record<string, unknown>
  ): Promise<{
    success: boolean;
    crmRecordId?: string;
    crmRecordUrl?: string;
    error?: string;
  }> {
    try {
      // Map standard fields to RD Station format
      const rdStationData = {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          conversion_identifier: 'consultor-ai-lead',
          email: data.email,
          name: data.name,
          mobile_phone: data.mobile_phone || data.phone,
          // Custom fields
          cf_perfil: data.cf_perfil || data.perfil,
          cf_faixa_etaria: data.cf_faixa_etaria || data.faixa_etaria,
          cf_coparticipacao: data.cf_coparticipacao || data.coparticipacao,
          // Lead scoring
          lead_scoring_score: data.lead_scoring_score || data.score,
          // Traffic source
          traffic_source: data.traffic_source || 'consultor-ai',
          // Additional metadata
          tags: ['consultor-ai', 'whatsapp-lead'],
          ...filterCustomFields(data),
        },
      };

      const response = await fetch(`${RD_STATION_API_BASE}/platform/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rdStationData),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as RDStationError;
        console.error('RD Station create lead failed:', response.status, errorData);

        return {
          success: false,
          error: errorData.error_message || `Erro ${response.status}: ${response.statusText}`,
        };
      }

      const result = await response.json();

      // Try to get the contact UUID if email was provided
      let contactId: string | undefined;
      if (data.email && typeof data.email === 'string') {
        const contactResult = await getContactByEmail(apiKey, data.email);
        contactId = contactResult?.uuid;
      }

      return {
        success: true,
        crmRecordId: contactId || result.event_uuid,
        crmRecordUrl: contactId ? `https://app.rdstation.com.br/leads/${contactId}` : undefined,
      };
    } catch (error) {
      console.error('RD Station create lead error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  },
};

/**
 * Get contact by email from RD Station
 */
async function getContactByEmail(apiKey: string, email: string): Promise<RDStationContact | null> {
  try {
    const response = await fetch(
      `${RD_STATION_API_BASE}/platform/contacts/email:${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as RDStationContact;
  } catch {
    return null;
  }
}

/**
 * Filter and format custom fields for RD Station
 * Custom fields must be prefixed with 'cf_'
 */
function filterCustomFields(data: Record<string, unknown>): Record<string, unknown> {
  const customFields: Record<string, unknown> = {};

  // Standard fields to exclude from custom fields
  const standardFields = [
    'email',
    'name',
    'mobile_phone',
    'phone',
    'cf_perfil',
    'cf_faixa_etaria',
    'cf_coparticipacao',
    'lead_scoring_score',
    'score',
    'traffic_source',
    'perfil',
    'faixa_etaria',
    'coparticipacao',
  ];

  for (const [key, value] of Object.entries(data)) {
    if (!standardFields.includes(key) && value !== undefined && value !== null) {
      // Ensure custom field prefix
      const fieldKey = key.startsWith('cf_') ? key : `cf_${key}`;
      customFields[fieldKey] = value;
    }
  }

  return customFields;
}

export default rdStationProvider;
