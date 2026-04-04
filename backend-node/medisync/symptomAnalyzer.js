/**
 * MediSync Symptom Analyzer
 * Maps symptoms to possible diseases and medical conditions
 * Provides severity scoring and doctor specialty recommendations
 */

// Comprehensive symptom-to-disease mapping database
const symptomDiseaseMap = {
  // Cardiovascular conditions
  'chest pain': {
    conditions: ['Acute Coronary Syndrome', 'Angina', 'Myocardial Infarction', 'Pericarditis', 'Pulmonary Embolism'],
    severity: 0.85,
    specialists: ['Cardiologist', 'Emergency Medicine'],
    urgency: 'HIGH',
  },
  'shortness of breath': {
    conditions: ['Asthma', 'COPD', 'Pneumonia', 'Heart Failure', 'Pulmonary Embolism'],
    severity: 0.75,
    specialists: ['Pulmonologist', 'Cardiologist'],
    urgency: 'HIGH',
  },
  'palpitations': {
    conditions: ['Arrhythmia', 'Tachycardia', 'Atrial Fibrillation', 'Anxiety'],
    severity: 0.65,
    specialists: ['Cardiologist'],
    urgency: 'MEDIUM',
  },
  'high blood pressure': {
    conditions: ['Hypertension', 'Preeclampsia', 'Kidney Disease'],
    severity: 0.55,
    specialists: ['Cardiologist', 'Internal Medicine'],
    urgency: 'MEDIUM',
  },

  // Respiratory conditions
  'cough': {
    conditions: ['Common Cold', 'Bronchitis', 'Pneumonia', 'Asthma', 'Tuberculosis'],
    severity: 0.45,
    specialists: ['Pulmonologist', 'General Practitioner'],
    urgency: 'LOW',
  },
  'sore throat': {
    conditions: ['Pharyngitis', 'Tonsillitis', 'Strep Throat', 'Mononucleosis'],
    severity: 0.35,
    specialists: ['ENT', 'General Practitioner'],
    urgency: 'LOW',
  },
  'fever': {
    conditions: ['Influenza', 'Common Cold', 'Infection', 'Pneumonia'],
    severity: 0.50,
    specialists: ['General Practitioner', 'Infectious Disease'],
    urgency: 'MEDIUM',
  },

  // Gastrointestinal conditions
  'abdominal pain': {
    conditions: ['Appendicitis', 'Gastroenteritis', 'Peptic Ulcer', 'Pancreatitis', 'Cholecystitis'],
    severity: 0.70,
    specialists: ['Gastroenterologist', 'General Surgeon'],
    urgency: 'HIGH',
  },
  'nausea': {
    conditions: ['Gastroenteritis', 'Migraine', 'Pregnancy', 'Medication Side Effect'],
    severity: 0.40,
    specialists: ['Gastroenterologist', 'General Practitioner'],
    urgency: 'LOW',
  },
  'diarrhea': {
    conditions: ['Gastroenteritis', 'IBS', 'Celiac Disease', 'Crohn\'s Disease'],
    severity: 0.45,
    specialists: ['Gastroenterologist'],
    urgency: 'MEDIUM',
  },

  // Neurological conditions
  'headache': {
    conditions: ['Migraine', 'Tension Headache', 'Cluster Headache', 'Meningitis'],
    severity: 0.40,
    specialists: ['Neurologist', 'General Practitioner'],
    urgency: 'LOW',
  },
  'dizziness': {
    conditions: ['Vertigo', 'Anemia', 'Hypotension', 'Inner Ear Disorder'],
    severity: 0.50,
    specialists: ['Neurologist', 'ENT'],
    urgency: 'MEDIUM',
  },
  'seizures': {
    conditions: ['Epilepsy', 'Febrile Seizure', 'Hypoglycemia'],
    severity: 0.90,
    specialists: ['Neurologist', 'Emergency Medicine'],
    urgency: 'CRITICAL',
  },

  // Mental health conditions
  'anxiety': {
    conditions: ['Generalized Anxiety Disorder', 'Panic Disorder', 'Social Anxiety'],
    severity: 0.45,
    specialists: ['Psychiatrist', 'Psychologist'],
    urgency: 'MEDIUM',
  },
  'depression': {
    conditions: ['Major Depressive Disorder', 'Bipolar Disorder', 'Dysthymia'],
    severity: 0.55,
    specialists: ['Psychiatrist', 'Psychologist'],
    urgency: 'MEDIUM',
  },
  'insomnia': {
    conditions: ['Sleep Disorder', 'Anxiety', 'Depression', 'Sleep Apnea'],
    severity: 0.40,
    specialists: ['Sleep Medicine', 'Psychiatrist'],
    urgency: 'LOW',
  },

  // Dermatological conditions
  'rash': {
    conditions: ['Dermatitis', 'Eczema', 'Psoriasis', 'Allergic Reaction', 'Measles'],
    severity: 0.35,
    specialists: ['Dermatologist'],
    urgency: 'LOW',
  },
  'itching': {
    conditions: ['Dermatitis', 'Scabies', 'Allergic Reaction', 'Dry Skin'],
    severity: 0.30,
    specialists: ['Dermatologist'],
    urgency: 'LOW',
  },

  // Metabolic conditions
  'fatigue': {
    conditions: ['Anemia', 'Thyroid Disorder', 'Depression', 'Sleep Disorder', 'Diabetes'],
    severity: 0.45,
    specialists: ['Internal Medicine', 'Endocrinologist'],
    urgency: 'MEDIUM',
  },
  'weight loss': {
    conditions: ['Diabetes', 'Cancer', 'Hyperthyroidism', 'Depression'],
    severity: 0.65,
    specialists: ['Endocrinologist', 'Oncologist'],
    urgency: 'MEDIUM',
  },
  'excessive thirst': {
    conditions: ['Diabetes', 'Hyperthyroidism', 'Dehydration'],
    severity: 0.50,
    specialists: ['Endocrinologist'],
    urgency: 'MEDIUM',
  },

  // Musculoskeletal conditions
  'joint pain': {
    conditions: ['Arthritis', 'Osteoarthritis', 'Rheumatoid Arthritis', 'Gout'],
    severity: 0.45,
    specialists: ['Rheumatologist', 'Orthopedist'],
    urgency: 'LOW',
  },
  'back pain': {
    conditions: ['Muscle Strain', 'Herniated Disc', 'Osteoarthritis', 'Sciatica'],
    severity: 0.50,
    specialists: ['Orthopedist', 'Physiatrist'],
    urgency: 'MEDIUM',
  },
  'muscle weakness': {
    conditions: ['Myopathy', 'Neuropathy', 'Stroke', 'Parkinson\'s Disease'],
    severity: 0.70,
    specialists: ['Neurologist', 'Physical Medicine'],
    urgency: 'HIGH',
  },
};

// Doctor specialty descriptions
const specialtyDescriptions = {
  'Cardiologist': 'Heart and cardiovascular system specialist',
  'Pulmonologist': 'Lung and respiratory system specialist',
  'Gastroenterologist': 'Digestive system specialist',
  'Neurologist': 'Nervous system and brain specialist',
  'Psychiatrist': 'Mental health and behavioral specialist',
  'Dermatologist': 'Skin specialist',
  'Endocrinologist': 'Hormone and metabolic specialist',
  'Rheumatologist': 'Joint and autoimmune disease specialist',
  'Orthopedist': 'Bone and joint specialist',
  'ENT': 'Ear, nose, and throat specialist',
  'General Practitioner': 'Primary care physician',
  'Emergency Medicine': 'Emergency and acute care specialist',
  'Oncologist': 'Cancer specialist',
  'Infectious Disease': 'Infection specialist',
  'General Surgeon': 'Surgical specialist',
  'Psychologist': 'Mental health counselor',
  'Physical Medicine': 'Rehabilitation specialist',
};

/**
 * Analyze symptoms and return possible conditions
 * @param {string[]} symptoms - Array of symptoms
 * @returns {object} Analysis results with conditions, severity, and specialists
 */
export const analyzeSymptoms = (symptoms) => {
  if (!symptoms || symptoms.length === 0) {
    return {
      success: false,
      error: 'No symptoms provided',
    };
  }

  const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim());

  // Find matching conditions
  const matchedConditions = new Map();
  let maxSeverity = 0;
  let recommendedSpecialists = new Set();
  let urgencyLevel = 'LOW';

  normalizedSymptoms.forEach((symptom) => {
    const match = Object.entries(symptomDiseaseMap).find(
      ([key]) => key.includes(symptom) || symptom.includes(key)
    );

    if (match) {
      const [, data] = match;
      maxSeverity = Math.max(maxSeverity, data.severity);
      urgencyLevel = getHighestUrgency(urgencyLevel, data.urgency);

      data.conditions.forEach((condition) => {
        matchedConditions.set(condition, (matchedConditions.get(condition) || 0) + 1);
      });

      data.specialists.forEach((spec) => {
        recommendedSpecialists.add(spec);
      });
    }
  });

  // Sort conditions by frequency
  const sortedConditions = Array.from(matchedConditions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Top 5 conditions
    .map(([condition]) => condition);

  return {
    success: true,
    symptoms: normalizedSymptoms,
    possible_conditions: sortedConditions,
    severity_score: Math.min(maxSeverity, 1.0), // Normalize to 0-1
    urgency_level: urgencyLevel,
    recommended_specialists: Array.from(recommendedSpecialists),
    specialist_descriptions: getSpecialistDescriptions(Array.from(recommendedSpecialists)),
    confidence: calculateConfidence(normalizedSymptoms.length, sortedConditions.length),
  };
};

/**
 * Get doctor specialty recommendations based on conditions
 * @param {string[]} conditions - Array of possible conditions
 * @returns {object} Specialty recommendations
 */
export const getSpecialtyRecommendations = (conditions) => {
  if (!conditions || conditions.length === 0) {
    return {
      success: false,
      error: 'No conditions provided',
    };
  }

  const specialties = new Set();
  const conditionMap = new Map();

  conditions.forEach((condition) => {
    // Find matching condition in symptom-disease map
    Object.values(symptomDiseaseMap).forEach((data) => {
      if (data.conditions.includes(condition)) {
        data.specialists.forEach((spec) => specialties.add(spec));
        conditionMap.set(condition, data.specialists);
      }
    });
  });

  return {
    success: true,
    conditions,
    recommended_specialists: Array.from(specialties),
    specialist_descriptions: getSpecialistDescriptions(Array.from(specialties)),
    condition_specialist_mapping: Object.fromEntries(conditionMap),
  };
};

/**
 * Get treatment recommendations for a condition
 * @param {string} condition - Medical condition
 * @returns {object} Treatment recommendations
 */
export const getTreatmentRecommendations = (condition) => {
  const treatments = {
    'Acute Coronary Syndrome': {
      immediate_actions: ['Call emergency services', 'Chew aspirin if not allergic', 'Rest'],
      typical_treatment: 'Emergency hospitalization, cardiac catheterization, medications',
      follow_up: 'Cardiology consultation, lifestyle changes, medication management',
    },
    'Migraine': {
      immediate_actions: ['Rest in dark, quiet room', 'Apply cold compress', 'Take over-the-counter pain reliever'],
      typical_treatment: 'Triptans, NSAIDs, preventive medications',
      follow_up: 'Neurologist consultation if frequent',
    },
    'Anxiety': {
      immediate_actions: ['Deep breathing exercises', 'Progressive muscle relaxation', 'Grounding techniques'],
      typical_treatment: 'Cognitive behavioral therapy, medications if needed',
      follow_up: 'Psychiatry or psychology consultation',
    },
    'Common Cold': {
      immediate_actions: ['Rest', 'Hydration', 'Over-the-counter symptom relief'],
      typical_treatment: 'Supportive care, rest, fluids',
      follow_up: 'Self-care, monitor for complications',
    },
    'Hypertension': {
      immediate_actions: ['Monitor blood pressure', 'Reduce sodium intake', 'Stress management'],
      typical_treatment: 'Antihypertensive medications, lifestyle modifications',
      follow_up: 'Regular blood pressure monitoring, cardiology follow-up',
    },
  };

  return treatments[condition] || {
    immediate_actions: ['Consult with healthcare provider'],
    typical_treatment: 'Depends on specific diagnosis and severity',
    follow_up: 'Follow provider recommendations',
  };
};

/**
 * Helper: Get highest urgency level
 */
function getHighestUrgency(current, new_) {
  const urgencyOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  return urgencyOrder[new_] > urgencyOrder[current] ? new_ : current;
}

/**
 * Helper: Get specialist descriptions
 */
function getSpecialistDescriptions(specialists) {
  return specialists.reduce((acc, spec) => {
    acc[spec] = specialtyDescriptions[spec] || 'Medical specialist';
    return acc;
  }, {});
}

/**
 * Helper: Calculate confidence score
 */
function calculateConfidence(symptomCount, conditionCount) {
  if (conditionCount === 0) return 0;
  return Math.min((symptomCount / 3) * (conditionCount / 5), 1.0);
}

export default {
  analyzeSymptoms,
  getSpecialtyRecommendations,
  getTreatmentRecommendations,
};
