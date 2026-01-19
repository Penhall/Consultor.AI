/**
 * Tests for encryption utilities
 */

import { describe, it, expect, beforeAll } from 'vitest'
import {
  encrypt,
  decrypt,
  generateEncryptionKey,
  isEncrypted,
  encryptIfNeeded,
  maskSensitiveData
} from './index'

describe('Encryption', () => {
  beforeAll(() => {
    // Set encryption key for tests
    process.env.ENCRYPTION_KEY = generateEncryptionKey()
  })

  describe('encrypt', () => {
    it('should encrypt a plaintext string', () => {
      const plaintext = 'my-secret-api-key'
      const encrypted = encrypt(plaintext)

      expect(encrypted).toBeTruthy()
      expect(encrypted).not.toBe(plaintext)
      expect(encrypted.split(':')).toHaveLength(3)
    })

    it('should produce different ciphertexts for same plaintext', () => {
      const plaintext = 'same-text'
      const encrypted1 = encrypt(plaintext)
      const encrypted2 = encrypt(plaintext)

      expect(encrypted1).not.toBe(encrypted2) // Different IVs
    })

    it('should throw error for empty string', () => {
      expect(() => encrypt('')).toThrow('Cannot encrypt empty string')
    })
  })

  describe('decrypt', () => {
    it('should decrypt an encrypted string correctly', () => {
      const plaintext = 'my-secret-api-key-12345'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should handle special characters', () => {
      const plaintext = 'Test!@#$%^&*()_+{}[]|\\:";\'<>?,./~`'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should handle unicode characters', () => {
      const plaintext = 'Olá! 你好 🎉'
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it('should throw error for invalid format', () => {
      expect(() => decrypt('invalid-format')).toThrow('Invalid encrypted data format')
    })

    it('should throw error for tampered data', () => {
      const plaintext = 'my-secret'
      const encrypted = encrypt(plaintext)

      // Tamper with ciphertext
      const parts = encrypted.split(':')
      if (parts[2]) {
        parts[2] = parts[2].replace('a', 'b')
      }
      const tampered = parts.join(':')

      expect(() => decrypt(tampered)).toThrow('Decryption failed')
    })

    it('should throw error for wrong key', () => {
      const plaintext = 'my-secret'
      const encrypted = encrypt(plaintext)

      // Change encryption key
      process.env.ENCRYPTION_KEY = generateEncryptionKey()

      expect(() => decrypt(encrypted)).toThrow('Decryption failed')
    })
  })

  describe('generateEncryptionKey', () => {
    it('should generate a valid base64 key', () => {
      const key = generateEncryptionKey()

      expect(key).toBeTruthy()
      expect(Buffer.from(key, 'base64').length).toBe(32)
    })

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey()
      const key2 = generateEncryptionKey()

      expect(key1).not.toBe(key2)
    })
  })

  describe('isEncrypted', () => {
    it('should return true for encrypted data', () => {
      const plaintext = 'my-secret'
      const encrypted = encrypt(plaintext)

      expect(isEncrypted(encrypted)).toBe(true)
    })

    it('should return false for plaintext', () => {
      expect(isEncrypted('plaintext')).toBe(false)
      expect(isEncrypted('not:encrypted:data')).toBe(false)
    })

    it('should return false for null/undefined', () => {
      expect(isEncrypted('')).toBe(false)
      expect(isEncrypted(null as any)).toBe(false)
      expect(isEncrypted(undefined as any)).toBe(false)
    })
  })

  describe('encryptIfNeeded', () => {
    it('should encrypt plaintext', () => {
      const plaintext = 'my-secret'
      const result = encryptIfNeeded(plaintext)

      expect(isEncrypted(result)).toBe(true)
      expect(decrypt(result)).toBe(plaintext)
    })

    it('should not re-encrypt already encrypted data', () => {
      const plaintext = 'my-secret'
      const encrypted = encrypt(plaintext)
      const result = encryptIfNeeded(encrypted)

      expect(result).toBe(encrypted)
    })
  })

  describe('maskSensitiveData', () => {
    it('should mask long strings', () => {
      const data = 'my-secret-api-key-123456'
      const masked = maskSensitiveData(data)

      expect(masked).toBe('my-s...3456')
      expect(masked).not.toContain('secret')
    })

    it('should mask short strings completely', () => {
      expect(maskSensitiveData('short')).toBe('****')
      expect(maskSensitiveData('1234567')).toBe('****')
    })

    it('should handle empty strings', () => {
      expect(maskSensitiveData('')).toBe('****')
    })
  })

  describe('End-to-end encryption workflow', () => {
    it('should encrypt and decrypt Meta access token', () => {
      const accessToken = 'EAABsbCS1iHgBO7ZC8wc4FRxkZBpgpRpZBpgpRpZBpgpRpZBpgpRp'
      const encrypted = encrypt(accessToken)

      // Verify encrypted format
      expect(isEncrypted(encrypted)).toBe(true)

      // Verify decryption
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(accessToken)

      // Verify masking for logs
      const masked = maskSensitiveData(accessToken)
      expect(masked).toBe('EAAB...gpRp')
    })

    it('should handle multiple encryptions independently', () => {
      const data1 = 'api-key-1'
      const data2 = 'api-key-2'
      const data3 = 'api-key-3'

      const encrypted1 = encrypt(data1)
      const encrypted2 = encrypt(data2)
      const encrypted3 = encrypt(data3)

      // All different ciphertexts
      expect(encrypted1).not.toBe(encrypted2)
      expect(encrypted2).not.toBe(encrypted3)

      // All decrypt correctly
      expect(decrypt(encrypted1)).toBe(data1)
      expect(decrypt(encrypted2)).toBe(data2)
      expect(decrypt(encrypted3)).toBe(data3)
    })
  })
})
