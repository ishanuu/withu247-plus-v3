import mongoose from 'mongoose';

const emotionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dominant_emotion: {
      type: String,
      enum: ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral', 'unknown'],
      default: 'neutral',
    },
    emotion_probabilities: {
      angry: { type: Number, default: 0 },
      disgust: { type: Number, default: 0 },
      fear: { type: Number, default: 0 },
      happy: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      surprise: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
    },
    negative_emotion_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    inference_time_ms: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('EmotionLog', emotionLogSchema);
