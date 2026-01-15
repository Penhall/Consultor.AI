/**
 * Health Check API Tests
 *
 * Tests the health check endpoint which returns system status
 */

import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('deve retornar status ok', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
  })

  it('deve retornar timestamp válido (ISO 8601)', async () => {
    const response = await GET()
    const data = await response.json()

    const timestamp = new Date(data.timestamp)
    expect(timestamp).toBeInstanceOf(Date)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })

  it('deve retornar uptime como número positivo', async () => {
    const response = await GET()
    const data = await response.json()

    expect(typeof data.uptime).toBe('number')
    expect(data.uptime).toBeGreaterThanOrEqual(0)
  })

  it('deve incluir headers corretos', async () => {
    const response = await GET()

    expect(response.headers.get('content-type')).toContain('application/json')
  })
})
