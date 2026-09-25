import  { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: "Project", 
      required: true 
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { 
      type: String, 
      enum: ["pending", "paid", "partially-paid"], 
      default: "pending" 
    },

    tasksCovered: [
      { 
        type: Schema.Types.ObjectId, 
        ref: "WorkLog" 
      }
    ],

    reason: { type: String, required: true },
    timeline: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Payment = models.Payment || model("Payment", PaymentSchema);