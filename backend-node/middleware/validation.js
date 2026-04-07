/**
 * Input Validation Middleware
 * Validates all incoming requests
 */

const { AppError } = require('./errorHandler');

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
const isValidPassword = (password) => {
  // Min 8 chars, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Normalize and validate email
const validateEmail = (email) => {
  if (!email) {
    throw new AppError('Email is required', 400, { field: 'email' });
  }
  const normalized = email.toLowerCase().trim();
  if (!isValidEmail(normalized)) {
    throw new AppError('Invalid email format', 400, { field: 'email' });
  }
  return normalized;
};

// Validate password
const validatePassword = (password) => {
  if (!password) {
    throw new AppError('Password is required', 400, { field: 'password' });
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400, { field: 'password' });
  }
  if (!isValidPassword(password)) {
    throw new AppError(
      'Password must contain uppercase, lowercase, and number',
      400,
      { field: 'password' }
    );
  }
  return password;
};

// Validate name
const validateName = (name) => {
  if (!name) {
    throw new AppError('Name is required', 400, { field: 'name' });
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new AppError('Name must be at least 2 characters', 400, { field: 'name' });
  }
  if (trimmed.length > 100) {
    throw new AppError('Name must be less than 100 characters', 400, { field: 'name' });
  }
  return trimmed;
};

// Validate message
const validateMessage = (message) => {
  if (!message) {
    throw new AppError('Message is required', 400, { field: 'message' });
  }
  const trimmed = message.trim();
  if (trimmed.length < 1) {
    throw new AppError('Message cannot be empty', 400, { field: 'message' });
  }
  if (trimmed.length > 5000) {
    throw new AppError('Message must be less than 5000 characters', 400, { field: 'message' });
  }
  return trimmed;
};

// Validate symptoms array
const validateSymptoms = (symptoms) => {
  if (!Array.isArray(symptoms)) {
    throw new AppError('Symptoms must be an array', 400, { field: 'symptoms' });
  }
  if (symptoms.length === 0) {
    throw new AppError('At least one symptom is required', 400, { field: 'symptoms' });
  }
  if (symptoms.length > 20) {
    throw new AppError('Maximum 20 symptoms allowed', 400, { field: 'symptoms' });
  }
  
  return symptoms.map(s => {
    if (typeof s !== 'string') {
      throw new AppError('Each symptom must be a string', 400, { field: 'symptoms' });
    }
    const trimmed = s.trim();
    if (trimmed.length < 2) {
      throw new AppError('Each symptom must be at least 2 characters', 400, { field: 'symptoms' });
    }
    return trimmed.toLowerCase();
  });
};

// Validate image base64
const validateImage = (image) => {
  if (!image) {
    throw new AppError('Image is required', 400, { field: 'image' });
  }
  if (typeof image !== 'string') {
    throw new AppError('Image must be a string', 400, { field: 'image' });
  }
  if (!image.startsWith('data:image/')) {
    throw new AppError('Invalid image format', 400, { field: 'image' });
  }
  // Rough size check (max 5MB)
  if (image.length > 5 * 1024 * 1024) {
    throw new AppError('Image size must be less than 5MB', 400, { field: 'image' });
  }
  return image;
};

// Validate numeric range
const validateNumberRange = (value, min, max, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new AppError(`${fieldName} must be a number`, 400, { field: fieldName });
  }
  if (num < min || num > max) {
    throw new AppError(`${fieldName} must be between ${min} and ${max}`, 400, { field: fieldName });
  }
  return num;
};

// Validate coordinates
const validateCoordinates = (latitude, longitude) => {
  const lat = validateNumberRange(latitude, -90, 90, 'latitude');
  const lng = validateNumberRange(longitude, -180, 180, 'longitude');
  return { latitude: lat, longitude: lng };
};

// Validate specialty
const validSpecialties = [
  'cardiologist',
  'dermatologist',
  'neurologist',
  'psychiatrist',
  'orthopedist',
  'pediatrician',
  'gynecologist',
  'general_practitioner'
];

const validateSpecialty = (specialty) => {
  if (!specialty) {
    throw new AppError('Specialty is required', 400, { field: 'specialty' });
  }
  const normalized = specialty.toLowerCase().trim();
  if (!validSpecialties.includes(normalized)) {
    throw new AppError(
      `Invalid specialty. Valid options: ${validSpecialties.join(', ')}`,
      400,
      { field: 'specialty' }
    );
  }
  return normalized;
};

// Validate risk signals
const validateRiskSignals = (signals) => {
  if (!signals || typeof signals !== 'object') {
    throw new AppError('Signals must be an object', 400, { field: 'signals' });
  }

  const { symptomSeverity, negativeEmotionScore, sentimentScore } = signals;

  const validated = {
    symptomSeverity: validateNumberRange(symptomSeverity, 0, 1, 'symptomSeverity'),
    negativeEmotionScore: validateNumberRange(negativeEmotionScore, 0, 1, 'negativeEmotionScore'),
    sentimentScore: validateNumberRange(sentimentScore, 0, 1, 'sentimentScore')
  };

  return validated;
};

// Pagination validation
const validatePagination = (page, limit) => {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;

  if (p < 1) {
    throw new AppError('Page must be at least 1', 400, { field: 'page' });
  }
  if (l < 1 || l > 100) {
    throw new AppError('Limit must be between 1 and 100', 400, { field: 'limit' });
  }

  return { page: p, limit: l, skip: (p - 1) * l };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateMessage,
  validateSymptoms,
  validateImage,
  validateNumberRange,
  validateCoordinates,
  validateSpecialty,
  validateRiskSignals,
  validatePagination,
  isValidEmail,
  isValidPassword,
  validSpecialties
};
