import {
  findNearbyHospitals,
  findDoctorsBySpecialty,
  getPlaceDetails,
  geocodeAddress,
} from '../maps/googleMapsService.js';
import logger from '../utils/logger.js';

/**
 * Find nearby hospitals
 */
export const getNearbyHospitals = async (req, res) => {
  const { latitude, longitude, radius = 5000 } = req.query;

  try {
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinate or radius values',
      });
    }

    const result = await findNearbyHospitals(lat, lng, rad);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get nearby hospitals error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to find nearby hospitals',
      details: error.message,
    });
  }
};

/**
 * Find doctors by specialty
 */
export const getDoctorsBySpecialty = async (req, res) => {
  const { specialty, latitude, longitude, radius = 5000 } = req.query;

  try {
    if (!specialty || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'specialty, latitude, and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinate or radius values',
      });
    }

    const result = await findDoctorsBySpecialty(specialty, lat, lng, rad);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get doctors by specialty error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to find doctors',
      details: error.message,
    });
  }
};

/**
 * Get place details
 */
export const getDetails = async (req, res) => {
  const { placeId } = req.query;

  try {
    if (!placeId) {
      return res.status(400).json({
        success: false,
        error: 'placeId is required',
      });
    }

    const result = await getPlaceDetails(placeId);

    return res.status(200).json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    logger.error('Get place details error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get place details',
      details: error.message,
    });
  }
};

/**
 * Geocode address
 */
export const geocode = async (req, res) => {
  const { address } = req.query;

  try {
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'address is required',
      });
    }

    const result = await geocodeAddress(address);

    return res.status(200).json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    logger.error('Geocode error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to geocode address',
      details: error.message,
    });
  }
};

export default {
  getNearbyHospitals,
  getDoctorsBySpecialty,
  getDetails,
  geocode,
};
