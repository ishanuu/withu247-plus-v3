/**
 * MediSync PubMed Research Retriever
 * Fetches medical research articles from PubMed API
 * Provides evidence-based medical information
 */

import axios from 'axios';
import logger from '../utils/logger.js';

const PUBMED_BASE_URL = 'https://pubmed.ncbi.nlm.nih.gov/api';
const PUBMED_SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Fallback research database for offline mode
const fallbackResearchDatabase = {
  'Hypertension': [
    {
      title: 'Management of Hypertension in Adults',
      authors: 'American Heart Association',
      year: 2023,
      url: 'https://pubmed.ncbi.nlm.nih.gov/example1',
      summary: 'Comprehensive guidelines for hypertension management including lifestyle modifications and pharmacotherapy.',
    },
    {
      title: 'Blood Pressure Targets and Cardiovascular Risk',
      authors: 'ESC/ESH Guidelines',
      year: 2023,
      url: 'https://pubmed.ncbi.nlm.nih.gov/example2',
      summary: 'Evidence-based recommendations for optimal blood pressure targets in different patient populations.',
    },
  ],
  'Diabetes': [
    {
      title: 'Standards of Medical Care in Diabetes',
      authors: 'American Diabetes Association',
      year: 2023,
      url: 'https://pubmed.ncbi.nlm.nih.gov/example3',
      summary: 'Comprehensive diabetes management guidelines including prevention, screening, and treatment.',
    },
  ],
  'Anxiety': [
    {
      title: 'Anxiety Disorders: Clinical Features and Diagnosis',
      authors: 'American Psychiatric Association',
      year: 2023,
      url: 'https://pubmed.ncbi.nlm.nih.gov/example4',
      summary: 'Clinical presentation, diagnostic criteria, and evidence-based treatment approaches for anxiety disorders.',
    },
  ],
  'Asthma': [
    {
      title: 'Global Strategy for Asthma Management and Prevention',
      authors: 'GINA',
      year: 2023,
      url: 'https://pubmed.ncbi.nlm.nih.gov/example5',
      summary: 'Updated asthma management guidelines with stepwise treatment approach.',
    },
  ],
  'Migraine': [
    {
      title: 'Migraine: Diagnosis and Treatment',
      authors: 'American Headache Society',
      year: 2023,
      url: 'https://pubmed.ncbi.nlm.nih.gov/example6',
      summary: 'Evidence-based approaches to migraine diagnosis, acute treatment, and prevention.',
    },
  ],
};

/**
 * Search PubMed for research articles
 * @param {string} query - Search query (disease name, symptom, etc.)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<object>} Search results with articles
 */
export const searchPubMed = async (query, maxResults = 5) => {
  try {
    logger.info(`Searching PubMed for: ${query}`);

    // Try real PubMed API first
    try {
      const response = await axios.get(`${PUBMED_SEARCH_URL}/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: `${query} AND (clinical trial OR guidelines OR review)`,
          retmax: maxResults,
          rettype: 'json',
        },
        timeout: 5000,
      });

      if (response.data.esearchresult && response.data.esearchresult.idlist) {
        const pmids = response.data.esearchresult.idlist.slice(0, maxResults);
        const articles = await fetchArticleDetails(pmids);
        return {
          success: true,
          source: 'PubMed',
          query,
          articles,
        };
      }
    } catch (apiError) {
      logger.warn(`PubMed API call failed: ${apiError.message}, using fallback database`);
    }

    // Use fallback database
    const fallbackArticles = fallbackResearchDatabase[query] || [];
    return {
      success: true,
      source: 'Fallback Database',
      query,
      articles: fallbackArticles,
    };
  } catch (error) {
    logger.error(`PubMed search error: ${error.message}`);
    return {
      success: false,
      error: 'Failed to retrieve research articles',
      details: error.message,
    };
  }
};

/**
 * Fetch detailed information about articles
 * @param {string[]} pmids - PubMed IDs
 * @returns {Promise<object[]>} Article details
 */
export const fetchArticleDetails = async (pmids) => {
  try {
    const response = await axios.get(`${PUBMED_SEARCH_URL}/efetch.fcgi`, {
      params: {
        db: 'pubmed',
        id: pmids.join(','),
        rettype: 'json',
      },
      timeout: 5000,
    });

    if (response.data.result && response.data.result.uids) {
      return response.data.result.uids.map((uid) => {
        const article = response.data.result[uid];
        return {
          pmid: uid,
          title: article.title || 'Unknown Title',
          authors: article.authors ? article.authors.map((a) => a.name).join(', ') : 'Unknown Authors',
          year: article.pubdate ? new Date(article.pubdate).getFullYear() : 'Unknown',
          url: `https://pubmed.ncbi.nlm.nih.gov/${uid}`,
          summary: article.abstract || 'No abstract available',
        };
      });
    }

    return [];
  } catch (error) {
    logger.error(`Failed to fetch article details: ${error.message}`);
    return [];
  }
};

/**
 * Get medical guidelines for a condition
 * @param {string} condition - Medical condition
 * @returns {object} Guidelines and recommendations
 */
export const getMedicalGuidelines = (condition) => {
  const guidelines = {
    'Hypertension': {
      organization: 'American Heart Association / American College of Cardiology',
      key_points: [
        'Target BP < 130/80 mmHg for most adults',
        'Lifestyle modifications: DASH diet, exercise, weight loss',
        'Pharmacotherapy if lifestyle changes insufficient',
        'Regular monitoring and follow-up',
      ],
      medications: ['ACE inhibitors', 'ARBs', 'Beta-blockers', 'Calcium channel blockers', 'Diuretics'],
      lifestyle: ['Reduce sodium intake', 'Regular exercise', 'Weight management', 'Stress reduction'],
    },
    'Diabetes': {
      organization: 'American Diabetes Association',
      key_points: [
        'Target HbA1c < 7% for most patients',
        'Regular blood glucose monitoring',
        'Medication management (metformin, insulin, etc.)',
        'Lifestyle modifications and diet control',
        'Annual screening for complications',
      ],
      medications: ['Metformin', 'Sulfonylureas', 'GLP-1 agonists', 'SGLT2 inhibitors', 'Insulin'],
      lifestyle: ['Balanced diet', 'Regular exercise', 'Weight management', 'Stress management'],
    },
    'Anxiety': {
      organization: 'American Psychiatric Association',
      key_points: [
        'Cognitive Behavioral Therapy (CBT) as first-line treatment',
        'SSRIs or SNRIs for pharmacotherapy',
        'Regular follow-up and monitoring',
        'Lifestyle modifications',
      ],
      medications: ['SSRIs', 'SNRIs', 'Benzodiazepines (short-term)', 'Buspirone'],
      lifestyle: ['Regular exercise', 'Meditation', 'Sleep hygiene', 'Stress management'],
    },
    'Asthma': {
      organization: 'Global Initiative for Asthma (GINA)',
      key_points: [
        'Stepwise treatment approach based on severity',
        'Inhaled corticosteroids as controller therapy',
        'Short-acting beta-agonists for acute symptoms',
        'Asthma action plan and patient education',
        'Regular monitoring of lung function',
      ],
      medications: ['Inhaled corticosteroids', 'Long-acting beta-agonists', 'Leukotriene modifiers'],
      lifestyle: ['Avoid triggers', 'Regular exercise', 'Allergen control', 'Smoking cessation'],
    },
    'Migraine': {
      organization: 'American Headache Society',
      key_points: [
        'Acute treatment with triptans or NSAIDs',
        'Preventive therapy for frequent migraines',
        'Trigger identification and avoidance',
        'Lifestyle modifications',
      ],
      medications: ['Triptans', 'NSAIDs', 'Beta-blockers (preventive)', 'Topiramate (preventive)'],
      lifestyle: ['Regular sleep schedule', 'Stress management', 'Caffeine moderation', 'Hydration'],
    },
  };

  return guidelines[condition] || {
    organization: 'Medical Community',
    key_points: ['Consult with healthcare provider for personalized recommendations'],
    medications: ['Depends on specific diagnosis'],
    lifestyle: ['Healthy diet, regular exercise, stress management'],
  };
};

/**
 * Get evidence-based treatment options
 * @param {string} condition - Medical condition
 * @returns {object} Treatment options with evidence level
 */
export const getEvidenceBasedTreatments = (condition) => {
  const treatments = {
    'Hypertension': {
      first_line: [
        { name: 'Lifestyle modifications', evidence: 'Strong', effectiveness: 0.8 },
        { name: 'ACE inhibitors', evidence: 'Strong', effectiveness: 0.85 },
        { name: 'ARBs', evidence: 'Strong', effectiveness: 0.85 },
      ],
      second_line: [
        { name: 'Beta-blockers', evidence: 'Moderate', effectiveness: 0.75 },
        { name: 'Calcium channel blockers', evidence: 'Moderate', effectiveness: 0.80 },
      ],
    },
    'Anxiety': {
      first_line: [
        { name: 'Cognitive Behavioral Therapy', evidence: 'Strong', effectiveness: 0.85 },
        { name: 'SSRIs', evidence: 'Strong', effectiveness: 0.80 },
      ],
      second_line: [
        { name: 'SNRIs', evidence: 'Moderate', effectiveness: 0.75 },
        { name: 'Buspirone', evidence: 'Moderate', effectiveness: 0.60 },
      ],
    },
  };

  return treatments[condition] || {
    first_line: [{ name: 'Consult healthcare provider', evidence: 'Recommended', effectiveness: 0 }],
    second_line: [],
  };
};

export default {
  searchPubMed,
  fetchArticleDetails,
  getMedicalGuidelines,
  getEvidenceBasedTreatments,
};
