import mongoose, { Schema } from "mongoose";

const VisitorLogSchema = new Schema({
  ip: String,
  country: String,
  city: String,
  org: String, // e.g. "Google", "Amazon Web Services", or "Comcast"
  path: String,
  useragent: String,
  createdAt: { type: Date, default: Date.now },
});

export const VisitorLog = mongoose.models.VisitorLog || mongoose.model("VisitorLog", VisitorLogSchema);