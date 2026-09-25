import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  type: "task" | "roadmap"; 
  dueDate?: string;
  quarter?: string; // e.g., "Q4 2026 - October" for roadmap items
  category: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    type: {
      type: String,
      enum: ["task", "roadmap"],
      default: "task",
    },
    dueDate: { type: String },
    quarter: { type: String },
    category: { type: String, default: "General" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;