/**
 * Input Validation Utilities
 * Provides validation for common data types and patterns
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*]/.test(password)) return false;
  return true;
};

/**
 * Validate phone number
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>\"']/g, '') // Remove HTML/script tags
    .trim()
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Validate request body
 */
export const validateRequestBody = (
  requiredFields: string[],
  optionalFields: string[] = []
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body || {};

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in body) || body[field] === null || body[field] === undefined) {
        res.status(400).json({
          success: false,
          error: `Missing required field: ${field}`,
        });
        return;
      }
    }

    // Sanitize body
    req.body = sanitizeObject(body);

    next();
  };
};

/**
 * Validate query parameters
 */
export const validateQueryParams = (allowedParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const query = req.query || {};

    // Check for unexpected parameters
    for (const param of Object.keys(query)) {
      if (!allowedParams.includes(param)) {
        res.status(400).json({
          success: false,
          error: `Unexpected query parameter: ${param}`,
        });
        return;
      }
    }

    next();
  };
};

/**
 * Validate specific field types
 */
export const validateField = (
  value: any,
  type: 'email' | 'password' | 'phone' | 'url' | 'string' | 'number' | 'boolean'
): boolean => {
  switch (type) {
    case 'email':
      return typeof value === 'string' && isValidEmail(value);
    case 'password':
      return typeof value === 'string' && isValidPassword(value);
    case 'phone':
      return typeof value === 'string' && isValidPhoneNumber(value);
    case 'url':
      return typeof value === 'string' && isValidUrl(value);
    case 'string':
      return typeof value === 'string' && value.length > 0;
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return false;
  }
};

/**
 * Validate object against schema
 */
export const validateSchema = (
  obj: Record<string, any>,
  schema: Record<string, 'email' | 'password' | 'phone' | 'url' | 'string' | 'number' | 'boolean'>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const [field, type] of Object.entries(schema)) {
    if (!(field in obj)) {
      errors.push(`Missing field: ${field}`);
      continue;
    }

    if (!validateField(obj[field], type)) {
      errors.push(`Invalid ${field}: expected ${type}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
  isValidUrl,
  sanitizeString,
  sanitizeObject,
  validateRequestBody,
  validateQueryParams,
  validateField,
  validateSchema,
};
