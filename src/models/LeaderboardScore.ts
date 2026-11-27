import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeaderboardScore extends Document {
  gameId: string;
  playerName: string;
  score: number;
  ipAddress?: string | null;
  createdAt: Date;
}

const LeaderboardScoreSchema = new Schema<ILeaderboardScore>(
  {
    gameId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    playerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 24,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

LeaderboardScoreSchema.index({ gameId: 1, score: -1, createdAt: 1 });

export const LeaderboardScore: Model<ILeaderboardScore> =
  mongoose.models.LeaderboardScore ||
  mongoose.model<ILeaderboardScore>("LeaderboardScore", LeaderboardScoreSchema);