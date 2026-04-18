import mongoose from 'mongoose';

const symptomRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symptoms: [String],
    possible_conditions: [
      {
        condition: String,
        likelihood: Number,
        description: String,
      },
    ],
    severity_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    recommended_specialist: String,
    treatment_summary: String,
    medical_sources: [
      {
        title: String,
        url: String,
        source: String,
      },
    ],
    risk_assessment: {
      score: Number,
      classification: String,
      components: {
        symptom: Number,
        emotion: Number,
        sentiment: Number,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SymptomRecord', symptomRecordSchema);
