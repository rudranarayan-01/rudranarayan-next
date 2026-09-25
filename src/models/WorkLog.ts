import  { Schema, model, models } from "mongoose";

const WorkLogSchema = new Schema(
  {
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: "Project", 
      required: true 
    },
    date: { type: Date, default: Date.now, required: true },
    logType: { 
      type: String, 
      enum: ["feature", "bug-fix", "refactor", "maintenance"], 
      required: true 
    },
    title: { type: String, required: true },
    details: { type: String, required: true },
    techStackUsed: [{ type: String }], 
    hoursSpent: { type: Number, default: 0 },
    
    // Links task to payment invoice once billed
    paymentId: { 
      type: Schema.Types.ObjectId, 
      ref: "Payment", 
      default: null 
    },
  },
  { timestamps: true }
);

export const WorkLog = models.WorkLog || model("WorkLog", WorkLogSchema);