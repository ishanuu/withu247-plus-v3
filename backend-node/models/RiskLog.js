import mongoose from 'mongoose';

const riskLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    signals: {
      symptom_severity: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
      },
      negative_emotion: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
      },
      sentiment_score: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
      },
    },
    risk_score: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    risk_level: {
      type: String,
      enum: ['MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      required: true,
    },
    escalation: {
      should_escalate: Boolean,
      escalation_level: String,
      actions: [String],
      reason: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
riskLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('RiskLog', riskLogSchema);
