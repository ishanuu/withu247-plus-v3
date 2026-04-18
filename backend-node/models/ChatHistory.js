import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    sentiment_score: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    sources: [
      {
        title: String,
        url: String,
        relevance: Number,
      },
    ],
    emotion_data: {
      dominant_emotion: String,
      negative_emotion_score: Number,
    },
    risk_assessment: {
      score: Number,
      classification: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ChatHistory', chatHistorySchema);
