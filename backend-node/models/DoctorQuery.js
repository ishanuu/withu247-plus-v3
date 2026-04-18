import mongoose from 'mongoose';

const doctorQuerySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    nearby_doctors: [
      {
        name: String,
        specialty: String,
        rating: Number,
        distance_km: Number,
        phone: String,
        address: String,
        place_id: String,
      },
    ],
    nearby_hospitals: [
      {
        name: String,
        rating: Number,
        distance_km: Number,
        phone: String,
        address: String,
        place_id: String,
      },
    ],
    selected_doctor: {
      name: String,
      specialty: String,
      contact: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('DoctorQuery', doctorQuerySchema);
