import dotenv from "dotenv";
import path from "path";

// 1. Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function seedHouseXpertz() {
  try {
    // 2. Dynamically import modules AFTER dotenv has loaded .env.local
    const { default: connectDB } = await import("../src/lib/db");
    const { Project } = await import("../src/models/Project");
    const { WorkLog } = await import("../src/models/WorkLog");
    const { Payment } = await import("../src/models/Payment");

    await connectDB();
    console.log("🔄 Connected to Database...");

    // 1. Create Project
    const project = await Project.create({
      name: "HouseXpertz",
      type: "freelance",
      status: "completed",
      description: "On-demand handyman services platform modeled after Urban Company with dynamic provider routing and automated booking flow.",
      techStack: ["React", "Express", "Node.js", "MongoDB", "TypeScript"],
      clientInfo: {
        name: "Shiv Kukreja",
        email: null,
        company: "Delhi Client",
      },
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-04-15"),
    });

    console.log("✅ Project Created:", project.name);

    // 2. Create Work Logs (Tasks)
    const task1 = await WorkLog.create({
      projectId: project._id,
      date: new Date("2026-03-05"),
      logType: "feature",
      title: "MERN Stack Architecture & MongoDB Schema Setup",
      details: "Configured Express server boilerplate, TypeScript interfaces, and MongoDB collection schemas for user accounts, booking transactions, and handyman listings.",
      techStackUsed: ["Express", "MongoDB", "TypeScript"],
      hoursSpent: 12,
    });

    const task2 = await WorkLog.create({
      projectId: project._id,
      date: new Date("2026-03-20"),
      logType: "feature",
      title: "Service Routing & Booking Workflow Integration",
      details: "Built the front-end service selection catalog in React and integrated back-end API endpoints for automated booking assignment and status updates.",
      techStackUsed: ["React", "Express", "MongoDB"],
      hoursSpent: 28,
    });

    const task3 = await WorkLog.create({
      projectId: project._id,
      date: new Date("2026-04-10"),
      logType: "bug-fix",
      title: "API Error Handling & CORS Resolution",
      details: "Resolved cross-origin API connection errors during production build deployment and optimized MongoDB query indexing.",
      techStackUsed: ["Node.js", "MongoDB"],
      hoursSpent: 8,
    });

    console.log("✅ 3 Work Logs Created.");

    // 3. Create Payment Record Linked to Tasks
    const payment = await Payment.create({
      projectId: project._id,
      amount: 40000,
      currency: "INR",
      status: "paid",
      tasksCovered: [task1._id, task2._id, task3._id],
      reason: "Full project payment for MERN-based HouseXpertz handyman application",
      timeline: {
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-04-15"),
      },
      paidAt: new Date("2026-04-16"),
    });

    // Link payment ID back to work logs
    await WorkLog.updateMany(
      { _id: { $in: [task1._id, task2._id, task3._id] } },
      { $set: { paymentId: payment._id } }
    );

    console.log("✅ Payment Record Created: ₹40,000 INR");
    console.log("🚀 HouseXpertz data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding HouseXpertz:", error);
    process.exit(1);
  }
}

seedHouseXpertz();