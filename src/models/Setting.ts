import { Schema, models, model } from "mongoose";

const ApiKeySchema = new Schema({
  name: { type: String, required: true },
  key: { type: String, required: true },
  status: { type: String, enum: ["Active", "Revoked"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

const SettingSchema = new Schema(
  {
    profile: {
      fullName: { type: String, default: "Super Admin" },
      email: { type: String, default: "admin@system.local" },
      title: { type: String, default: "Full Stack Engineer & Tech Lead" },
      bio: { type: String, default: "Passionate developer building scalable systems." },
      location: { type: String, default: "India / Remote" },
      website: { type: String, default: "https://portfolio.local" },
      github: { type: String, default: "github.com/admin" },
      linkedin: { type: String, default: "linkedin.com/in/admin" },
      avatarUrl: { type: String, default: "" },
      resumeUrl: { type: String, default: "" },
    },
    pricing: {
      hourlyRate: { type: Number, default: 75 },
      currency: { type: String, default: "USD" },
      minProjectBudget: { type: Number, default: 1000 },
      taxRate: { type: Number, default: 0 },
      paymentTerms: { type: String, default: "Net 15" },
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: true },
      sessionTimeoutMinutes: { type: Number, default: 60 },
      allowedIpAddresses: [{ type: String }],
    },
    system: {
      siteTitle: { type: String, default: "Admin Portfolio Console" },
      metaDescription: { type: String, default: "Enterprise Portfolio Platform" },
      maintenanceMode: { type: Boolean, default: false },
      publicSignups: { type: Boolean, default: false },
      analyticsEnabled: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
    },
    apiKeys: [ApiKeySchema],
  },
  { timestamps: true }
);

export const Setting = models.Setting || model("Setting", SettingSchema);