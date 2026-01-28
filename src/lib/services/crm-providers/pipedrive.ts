/**
 * Pipedrive CRM Provider
 *
 * Implementation for Pipedrive API integration
 * API Documentation: https://developers.pipedrive.com/docs/api/v1
 */

import type { CRMProviderInterface } from '../crm-service';

const PIPEDRIVE_API_BASE = 'https://api.pipedrive.com/v1';

/**
 * Pipedrive API response types
 */
interface PipedriveUser {
  id: number;
  name: string;
  email: string;
  company_name?: string;
}

interface PipedrivePerson {
  id: number;
  name: string;
  email?: { value: string; primary: boolean }[];
  phone?: { value: string; primary: boolean }[];
}

interface PipedriveApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  error_info?: string;
}

/**
 * Pipedrive Provider Implementation
 */
const pipedriveProvider: CRMProviderInterface = {
  /**
   * Test connection to Pipedrive API
   */
  async testConnection(apiKey: string): Promise<{ connected: boolean; accountName?: string }> {
    try {
      const response = await fetch(`${PIPEDRIVE_API_BASE}/users/me?api_token=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Pipedrive connection test failed:', response.status);
        return { connected: false };
      }

      const result = (await response.json()) as PipedriveApiResponse<PipedriveUser>;

      if (!result.success) {
        return { connected: false };
      }

      return {
        connected: true,
        accountName: result.data.company_name || result.data.name,
      };
    } catch (error) {
      console.error('Pipedrive connection error:', error);
      return { connected: false };
    }
  },

  /**
   * Create or update a lead in Pipedrive
   *
   * Creates a Person (contact) and optionally a Deal
   * Documentation: https://developers.pipedrive.com/docs/api/v1/Persons
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
      // First, check if person exists by email or phone
      let existingPerson: PipedrivePerson | null = null;

      if (data.email && typeof data.email === 'string') {
        existingPerson = await searchPersonByEmail(apiKey, data.email);
      }

      if (!existingPerson && data.phone && typeof data.phone === 'string') {
        existingPerson = await searchPersonByPhone(apiKey, data.phone);
      }

      // Prepare person data
      const personData: Record<string, unknown> = {
        name: data.name || 'Lead sem nome',
      };

      // Add email if provided
      if (data.email) {
        personData.email = [{ value: data.email, primary: true, label: 'work' }];
      }

      // Add phone if provided
      if (data.phone) {
        personData.phone = [{ value: data.phone, primary: true, label: 'mobile' }];
      }

      // Add custom fields (must be configured in Pipedrive first)
      // Pipedrive uses custom field keys like 'a1b2c3d4e5f6...'
      // These need to be mapped in the integration settings
      if (data.perfil) personData.perfil = data.perfil;
      if (data.faixa_etaria) personData.faixa_etaria = data.faixa_etaria;
      if (data.coparticipacao) personData.coparticipacao = data.coparticipacao;

      let personId: number;

      if (existingPerson) {
        // Update existing person
        personId = existingPerson.id;

        const updateResponse = await fetch(
          `${PIPEDRIVE_API_BASE}/persons/${personId}?api_token=${apiKey}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(personData),
          }
        );

        if (!updateResponse.ok) {
          const errorResult = await updateResponse.json().catch(() => ({}));
          return {
            success: false,
            error: `Erro ao atualizar pessoa: ${errorResult.error || updateResponse.statusText}`,
          };
        }
      } else {
        // Create new person
        const createResponse = await fetch(`${PIPEDRIVE_API_BASE}/persons?api_token=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(personData),
        });

        if (!createResponse.ok) {
          const errorResult = await createResponse.json().catch(() => ({}));
          return {
            success: false,
            error: `Erro ao criar pessoa: ${errorResult.error || createResponse.statusText}`,
          };
        }

        const createResult = (await createResponse.json()) as PipedriveApiResponse<PipedrivePerson>;

        if (!createResult.success || !createResult.data) {
          return {
            success: false,
            error: createResult.error || 'Erro desconhecido ao criar pessoa',
          };
        }

        personId = createResult.data.id;
      }

      // Optionally create a deal for the person
      await createDealForPerson(apiKey, personId, data);

      // Get company domain for URL
      const userInfo = await getUserInfo(apiKey);
      const companyDomain = userInfo?.company_domain || 'app';

      return {
        success: true,
        crmRecordId: String(personId),
        crmRecordUrl: `https://${companyDomain}.pipedrive.com/person/${personId}`,
      };
    } catch (error) {
      console.error('Pipedrive create lead error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  },
};

/**
 * Search for a person by email
 */
async function searchPersonByEmail(apiKey: string, email: string): Promise<PipedrivePerson | null> {
  try {
    const response = await fetch(
      `${PIPEDRIVE_API_BASE}/persons/search?term=${encodeURIComponent(email)}&fields=email&exact_match=true&api_token=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.success && result.data?.items?.length > 0) {
      return result.data.items[0].item as PipedrivePerson;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Search for a person by phone
 */
async function searchPersonByPhone(apiKey: string, phone: string): Promise<PipedrivePerson | null> {
  try {
    const response = await fetch(
      `${PIPEDRIVE_API_BASE}/persons/search?term=${encodeURIComponent(phone)}&fields=phone&api_token=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.success && result.data?.items?.length > 0) {
      return result.data.items[0].item as PipedrivePerson;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Create a deal for a person (optional)
 */
async function createDealForPerson(
  apiKey: string,
  personId: number,
  data: Record<string, unknown>
): Promise<number | null> {
  try {
    // Only create deal if status indicates qualified lead
    const status = data.status as string | undefined;
    if (status !== 'qualificado' && status !== 'agendado') {
      return null;
    }

    const dealData = {
      title: `Lead: ${data.name || 'Sem nome'}`,
      person_id: personId,
      probability: data.probability || data.score || 50,
      status: 'open',
    };

    const response = await fetch(`${PIPEDRIVE_API_BASE}/deals?api_token=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dealData),
    });

    if (!response.ok) {
      console.warn('Failed to create deal for person:', personId);
      return null;
    }

    const result = await response.json();

    if (result.success && result.data) {
      return result.data.id;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get user/company info
 */
async function getUserInfo(apiKey: string): Promise<{ company_domain?: string } | null> {
  try {
    const response = await fetch(`${PIPEDRIVE_API_BASE}/users/me?api_token=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.success && result.data) {
      return {
        company_domain: result.data.company_domain,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export default pipedriveProvider;
