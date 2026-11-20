import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { newProjectsSeed } from "./seed";
import "dotenv/config";
// import path from "path";

// 1. Load environment variables first
// dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });


async function runSeed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    for (const projData of newProjectsSeed) {
      await Project.findOneAndUpdate(
        { slug: projData.slug },
        { $set: projData },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`Successfully seeded/updated: ${projData.name}`);
    }

    console.log("All projects seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();