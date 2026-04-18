/**
 * Google Maps Service
 * Location-based hospital and doctor discovery optimized for Delhi
 */

import axios from 'axios';
import logger from '../utils/logger.js';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

// Delhi coordinates (center)
const DELHI_CENTER = {
  lat: 28.7041,
  lng: 77.1025,
};

// Delhi medical specialties mapping
const SPECIALTY_KEYWORDS = {
  cardiologist: ['cardiologist', 'cardiology', 'heart specialist'],
  dermatologist: ['dermatologist', 'dermatology', 'skin specialist'],
  neurologist: ['neurologist', 'neurology', 'brain specialist'],
  psychiatrist: ['psychiatrist', 'psychiatry', 'mental health'],
  orthopedist: ['orthopedist', 'orthopedic', 'bone specialist'],
  pediatrician: ['pediatrician', 'pediatrics', 'child specialist'],
  gynecologist: ['gynecologist', 'gynecology', 'obstetrics'],
  general_practitioner: ['general practitioner', 'gp', 'family doctor'],
};

// Delhi hospitals database (fallback when API fails)
const DELHI_HOSPITALS = [
  {
    name: 'AIIMS Delhi',
    address: 'Ansari Nagar, New Delhi',
    lat: 28.5684,
    lng: 77.2093,
    rating: 4.7,
    type: 'Government Hospital',
    specialties: ['cardiology', 'neurology', 'orthopedics', 'pediatrics'],
  },
  {
    name: 'Max Healthcare - Saket',
    address: 'Saket, New Delhi',
    lat: 28.5244,
    lng: 77.1855,
    rating: 4.6,
    type: 'Private Hospital',
    specialties: ['cardiology', 'orthopedics', 'gynecology'],
  },
  {
    name: 'Apollo Hospital - Delhi',
    address: 'Sarita Vihar, New Delhi',
    lat: 28.5525,
    lng: 77.2505,
    rating: 4.5,
    type: 'Private Hospital',
    specialties: ['cardiology', 'neurology', 'dermatology'],
  },
  {
    name: 'Fortis Hospital - Vasant Kunj',
    address: 'Vasant Kunj, New Delhi',
    lat: 28.5244,
    lng: 77.1855,
    rating: 4.5,
    type: 'Private Hospital',
    specialties: ['orthopedics', 'pediatrics', 'psychiatry'],
  },
  {
    name: 'Sir Ganga Ram Hospital',
    address: 'Old Delhi, New Delhi',
    lat: 28.6505,
    lng: 77.2273,
    rating: 4.4,
    type: 'Private Hospital',
    specialties: ['cardiology', 'orthopedics', 'general'],
  },
  {
    name: 'Indraprastha Apollo Hospital',
    address: 'Mathura Road, New Delhi',
    lat: 28.5525,
    lng: 77.2505,
    rating: 4.6,
    type: 'Private Hospital',
    specialties: ['cardiology', 'neurology', 'orthopedics'],
  },
];

// Delhi doctors database (fallback)
const DELHI_DOCTORS = [
  {
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiologist',
    hospital: 'AIIMS Delhi',
    address: 'Ansari Nagar, New Delhi',
    lat: 28.5684,
    lng: 77.2093,
    rating: 4.8,
    experience: '15+ years',
    phone: '+91-XXXXXXXXXX',
  },
  {
    name: 'Dr. Priya Singh',
    specialty: 'Dermatologist',
    hospital: 'Max Healthcare',
    address: 'Saket, New Delhi',
    lat: 28.5244,
    lng: 77.1855,
    rating: 4.7,
    experience: '12+ years',
    phone: '+91-XXXXXXXXXX',
  },
  {
    name: 'Dr. Amit Patel',
    specialty: 'Neurologist',
    hospital: 'Apollo Hospital',
    address: 'Sarita Vihar, New Delhi',
    lat: 28.5525,
    lng: 77.2505,
    rating: 4.6,
    experience: '18+ years',
    phone: '+91-XXXXXXXXXX',
  },
  {
    name: 'Dr. Neha Gupta',
    specialty: 'Psychiatrist',
    hospital: 'Fortis Hospital',
    address: 'Vasant Kunj, New Delhi',
    lat: 28.5244,
    lng: 77.1855,
    rating: 4.5,
    experience: '10+ years',
    phone: '+91-XXXXXXXXXX',
  },
  {
    name: 'Dr. Vikram Sharma',
    specialty: 'Orthopedist',
    hospital: 'Sir Ganga Ram Hospital',
    address: 'Old Delhi, New Delhi',
    lat: 28.6505,
    lng: 77.2273,
    rating: 4.7,
    experience: '20+ years',
    phone: '+91-XXXXXXXXXX',
  },
];

/**
 * Find nearby hospitals in Delhi
 */
export const findNearbyHospitals = async (latitude, longitude, radius = 5000) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('Google Maps API key not configured, using fallback data');
      return getFallbackHospitals(latitude, longitude, radius);
    }

    const params = {
      location: `${latitude},${longitude}`,
      radius: radius,
      type: 'hospital',
      key: GOOGLE_MAPS_API_KEY,
    };

    const response = await axios.get(PLACES_API_URL, { params });

    if (response.data.status !== 'OK') {
      logger.warn(`Google Maps API error: ${response.data.status}`);
      return getFallbackHospitals(latitude, longitude, radius);
    }

    const hospitals = response.data.results.map((place) => ({
      name: place.name,
      address: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating || 0,
      type: 'Hospital',
      place_id: place.place_id,
      distance: calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
    }));

    // Sort by distance
    hospitals.sort((a, b) => a.distance - b.distance);

    return {
      success: true,
      hospitals: hospitals.slice(0, 20), // Return top 20
      total: hospitals.length,
    };
  } catch (error) {
    logger.error(`Find nearby hospitals error: ${error.message}`);
    return getFallbackHospitals(latitude, longitude, radius);
  }
};

/**
 * Find nearby doctors by specialty in Delhi
 */
export const findDoctorsBySpecialty = async (specialty, latitude, longitude, radius = 5000) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('Google Maps API key not configured, using fallback data');
      return getFallbackDoctors(specialty, latitude, longitude, radius);
    }

    // Search for doctors with specialty keywords
    const keywords = SPECIALTY_KEYWORDS[specialty.toLowerCase()] || [specialty];
    const searchQueries = keywords.map((kw) => `${kw} doctor near ${latitude},${longitude}`);

    const allResults = [];

    for (const query of searchQueries) {
      const params = {
        location: `${latitude},${longitude}`,
        radius: radius,
        keyword: query,
        type: 'doctor',
        key: GOOGLE_MAPS_API_KEY,
      };

      try {
        const response = await axios.get(PLACES_API_URL, { params });

        if (response.data.status === 'OK') {
          allResults.push(...response.data.results);
        }
      } catch (err) {
        logger.warn(`Search query failed: ${query}`);
      }
    }

    // Remove duplicates
    const uniqueResults = Array.from(new Map(allResults.map((item) => [item.place_id, item])).values());

    const doctors = uniqueResults.map((place) => ({
      name: place.name,
      address: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating || 0,
      specialty: specialty,
      place_id: place.place_id,
      distance: calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
    }));

    // Sort by rating and distance
    doctors.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.distance - b.distance;
    });

    return {
      success: true,
      doctors: doctors.slice(0, 20), // Return top 20
      total: doctors.length,
      specialty: specialty,
    };
  } catch (error) {
    logger.error(`Find doctors by specialty error: ${error.message}`);
    return getFallbackDoctors(specialty, latitude, longitude, radius);
  }
};

/**
 * Get detailed information about a place
 */
export const getPlaceDetails = async (placeId) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('Google Maps API key not configured');
      return {
        success: false,
        error: 'API key not configured',
      };
    }

    const params = {
      place_id: placeId,
      fields: 'name,rating,formatted_address,formatted_phone_number,website,opening_hours,reviews',
      key: GOOGLE_MAPS_API_KEY,
    };

    const response = await axios.get(PLACE_DETAILS_URL, { params });

    if (response.data.status !== 'OK') {
      return {
        success: false,
        error: response.data.status,
      };
    }

    const result = response.data.result;

    return {
      success: true,
      details: {
        name: result.name,
        rating: result.rating,
        address: result.formatted_address,
        phone: result.formatted_phone_number,
        website: result.website,
        hours: result.opening_hours?.weekday_text || [],
        reviews: result.reviews?.slice(0, 5) || [],
      },
    };
  } catch (error) {
    logger.error(`Get place details error: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Geocode address to get coordinates
 */
export const geocodeAddress = async (address) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      logger.warn('Google Maps API key not configured');
      return {
        success: false,
        error: 'API key not configured',
      };
    }

    const params = {
      address: address,
      key: GOOGLE_MAPS_API_KEY,
    };

    const response = await axios.get(GEOCODING_API_URL, { params });

    if (response.data.status !== 'OK' || response.data.results.length === 0) {
      return {
        success: false,
        error: 'Address not found',
      };
    }

    const location = response.data.results[0].geometry.location;

    return {
      success: true,
      lat: location.lat,
      lng: location.lng,
      address: response.data.results[0].formatted_address,
    };
  } catch (error) {
    logger.error(`Geocode address error: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Fallback hospitals data for Delhi
 */
const getFallbackHospitals = (latitude, longitude, radius) => {
  const filtered = DELHI_HOSPITALS.filter((hospital) => {
    const distance = calculateDistance(latitude, longitude, hospital.lat, hospital.lng);
    return distance <= radius / 1000; // Convert radius to km
  });

  filtered.sort((a, b) => {
    const distA = calculateDistance(latitude, longitude, a.lat, a.lng);
    const distB = calculateDistance(latitude, longitude, b.lat, b.lng);
    return distA - distB;
  });

  return {
    success: true,
    hospitals: filtered,
    total: filtered.length,
    source: 'fallback',
  };
};

/**
 * Fallback doctors data for Delhi
 */
const getFallbackDoctors = (specialty, latitude, longitude, radius) => {
  const filtered = DELHI_DOCTORS.filter((doctor) => {
    const distance = calculateDistance(latitude, longitude, doctor.lat, doctor.lng);
    const specialtyMatch = doctor.specialty.toLowerCase().includes(specialty.toLowerCase());
    return distance <= radius / 1000 && specialtyMatch;
  });

  filtered.sort((a, b) => {
    const distA = calculateDistance(latitude, longitude, a.lat, a.lng);
    const distB = calculateDistance(latitude, longitude, b.lat, b.lng);
    if (b.rating !== a.rating) return b.rating - a.rating;
    return distA - distB;
  });

  return {
    success: true,
    doctors: filtered,
    total: filtered.length,
    specialty: specialty,
    source: 'fallback',
  };
};

export default {
  findNearbyHospitals,
  findDoctorsBySpecialty,
  getPlaceDetails,
  geocodeAddress,
};
