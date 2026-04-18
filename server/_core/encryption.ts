/**
 * Encryption Utility for Sensitive Data
 * Provides AES-256-GCM encryption/decryption for sensitive fields
 */

import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const SALT = 'withu247-salt';

// Derive a proper key from the encryption key
const derivedKey = crypto.scryptSync(ENCRYPTION_KEY, SALT, 32);

/**
 * Encrypt sensitive data
 * @param data - Data to encrypt (string or object)
 * @returns Encrypted data with IV and auth tag
 */
export const encryptData = (data: string | object): string => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);

    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    let encrypted = cipher.update(stringData, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return combined: iv:encrypted:authTag
    const combined = `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    return combined;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 * @param encrypted - Encrypted data string (format: iv:encrypted:authTag)
 * @returns Decrypted data
 */
export const decryptData = (encrypted: string): string => {
  try {
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, encryptedHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Decrypt and parse JSON data
 * @param encrypted - Encrypted JSON data
 * @returns Parsed object
 */
export const decryptJSON = (encrypted: string): object => {
  const decrypted = decryptData(encrypted);
  return JSON.parse(decrypted);
};

/**
 * Hash sensitive data (one-way)
 * @param data - Data to hash
 * @returns Hash string
 */
export const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Verify hashed data
 * @param data - Original data
 * @param hash - Hash to verify against
 * @returns True if hash matches
 */
export const verifyHash = (data: string, hash: string): boolean => {
  return hashData(data) === hash;
};

export default {
  encryptData,
  decryptData,
  decryptJSON,
  hashData,
  verifyHash,
};
