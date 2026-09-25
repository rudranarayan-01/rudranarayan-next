import  { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["freelance", "office", "personal"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["active", "completed", "on-hold"], 
      default: "active" 
    },
    description: { type: String, required: true },
    techStack: [{ type: String }],
    
    // Freelance specific details (Null for office projects)
    clientInfo: {
      name: { type: String, default: null },
      email: { type: String, default: null },
      company: { type: String, default: null },
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Project = models.Project || model("Project", ProjectSchema);