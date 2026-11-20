import{ Schema, models, model } from "mongoose";

// Sub-schema for external or deployment links
const ProjectLinkSchema = new Schema({
  label: { type: String, required: true }, // e.g. "Live Demo", "GitHub", "API Docs"
  url: { type: String, required: true },
  icon: { type: String, default: "external" }, 
});

// Sub-schema for architecture flow steps
const ArchitectureFlowSchema = new Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  techUsed: [{ type: String }],
});

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    status: { type: String, enum: ["Published", "In Development", "Archived"], default: "Published" },
    
    // Core Media & Assets
    thumbnailUrl: { type: String }, 
    galleryImages: [{ type: String }],
    
    links: [ProjectLinkSchema],
    
    architectureFlow: [ArchitectureFlowSchema],
    
    techStack: [{ type: String }],
    clientInfo: {
      name: { type: String },
      company: { type: String },
    },
  },
  { timestamps: true }
);

export const Project = models.Project || model("Project", ProjectSchema);