/**
 * Encryption/Decryption utilities
 * Used to securely store consultant API keys and sensitive data
 *
 * Algorithm: AES-256-GCM (Galois/Counter Mode)
 * - Authenticated encryption (prevents tampering)
 * - 256-bit key length
 * - 16-byte IV (initialization vector)
 * - Auth tag for integrity verification
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 16 bytes = 128 bits
const AUTH_TAG_LENGTH = 16 // 16 bytes = 128 bits
const KEY_LENGTH = 32 // 32 bytes = 256 bits

/**
 * Gets the encryption key from environment
 * Validates key length and format
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with: openssl rand -base64 32'
    )
  }

  // Support both hex and base64 encoded keys
  let keyBuffer: Buffer

  if (key.length === KEY_LENGTH * 2) {
    // Hex encoded (64 characters)
    keyBuffer = Buffer.from(key, 'hex')
  } else {
    // Base64 encoded
    keyBuffer = Buffer.from(key, 'base64')
  }

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex chars or ${Math.ceil(KEY_LENGTH * 4 / 3)} base64 chars). ` +
      `Actual length: ${keyBuffer.length} bytes`
    )
  }

  return keyBuffer
}

/**
 * Encrypts a plaintext string
 *
 * @param plaintext - The text to encrypt
 * @returns Encrypted string in format: "iv:authTag:ciphertext" (all hex encoded)
 *
 * @example
 * const encrypted = encrypt("my-api-key-123")
 * // Returns: "a1b2c3...d4e5f6:g7h8i9...j0k1l2:m3n4o5...p6q7r8"
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string')
  }

  try {
    const key = getEncryptionKey()
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, key, iv)

    // Encrypt the plaintext
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Get authentication tag
    const authTag = cipher.getAuthTag()

    // Return format: iv:authTag:encrypted (all hex)
    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted
    ].join(':')
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Decrypts an encrypted string
 *
 * @param encryptedData - Encrypted string in format "iv:authTag:ciphertext"
 * @returns Decrypted plaintext string
 *
 * @example
 * const decrypted = decrypt("a1b2c3...d4e5f6:g7h8i9...j0k1l2:m3n4o5...p6q7r8")
 * // Returns: "my-api-key-123"
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty string')
  }

  try {
    const parts = encryptedData.split(':')

    if (parts.length !== 3) {
      throw new Error(
        'Invalid encrypted data format. Expected "iv:authTag:ciphertext"'
      )
    }

    const [ivHex, authTagHex, encrypted] = parts

    // Validate parts exist
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Missing encrypted data components')
    }

    // Validate part lengths
    if (ivHex.length !== IV_LENGTH * 2) {
      throw new Error(`Invalid IV length: ${ivHex.length} (expected ${IV_LENGTH * 2})`)
    }

    if (authTagHex.length !== AUTH_TAG_LENGTH * 2) {
      throw new Error(`Invalid auth tag length: ${authTagHex.length} (expected ${AUTH_TAG_LENGTH * 2})`)
    }

    const key = getEncryptionKey()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    // Don't expose encryption details in error messages
    if (error instanceof Error && error.message.includes('Unsupported state or unable to authenticate data')) {
      throw new Error('Decryption failed: Invalid encrypted data or wrong encryption key')
    }
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generates a random encryption key
 * Useful for testing or initial setup
 *
 * @returns Base64-encoded 256-bit key
 *
 * @example
 * const key = generateEncryptionKey()
 * console.log(key) // "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6=="
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('base64')
}

/**
 * Checks if a string is encrypted (has the correct format)
 *
 * @param data - String to check
 * @returns True if data appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false
  }

  const parts = data.split(':')
  return (
    parts.length === 3 &&
    parts[0] !== undefined && parts[0].length === IV_LENGTH * 2 &&
    parts[1] !== undefined && parts[1].length === AUTH_TAG_LENGTH * 2 &&
    parts[2] !== undefined && parts[2].length > 0
  )
}

/**
 * Safely encrypts data if not already encrypted
 * Useful for migration scenarios
 *
 * @param data - Data to encrypt (if not already encrypted)
 * @returns Encrypted data
 */
export function encryptIfNeeded(data: string): string {
  if (!data) {
    throw new Error('Cannot encrypt empty string')
  }

  return isEncrypted(data) ? data : encrypt(data)
}

/**
 * Masks sensitive data for logging
 * Shows first and last 4 characters only
 *
 * @param data - Sensitive string to mask
 * @returns Masked string
 *
 * @example
 * maskSensitiveData("my-secret-api-key-123456")
 * // Returns: "my-s...3456"
 */
export function maskSensitiveData(data: string): string {
  if (!data || data.length <= 8) {
    return '****'
  }

  const first = data.substring(0, 4)
  const last = data.substring(data.length - 4)

  return `${first}...${last}`
}
