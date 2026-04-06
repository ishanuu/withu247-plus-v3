import express from 'express';
import {
  getNearbyHospitals,
  getDoctorsBySpecialty,
  getDetails,
  geocode,
} from '../controllers/mapsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/nearby-hospitals', authenticateToken, getNearbyHospitals);
router.get('/doctors-by-specialty', authenticateToken, getDoctorsBySpecialty);
router.get('/place-details', authenticateToken, getDetails);
router.get('/geocode', authenticateToken, geocode);

export default router;
