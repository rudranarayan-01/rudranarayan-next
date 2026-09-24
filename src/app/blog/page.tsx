import React from "react";
import { getAllBlogs } from "@/lib/blogs";
import BlogDashboardClient from "@/app/components/BlogDashboardClient";
export const metadata = {
  title: "Engineering Blog | Portfolio Insights",
  description: "Deep dives into system architectures, full-stack pipelines, and production machine learning.",
};

export default function BlogDashboard() {
  const blogs = getAllBlogs();

  return (
    <main className="min-h-screen bg-black text-white py-24 px-4 md:px-16 selection:bg-neutral-800 selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Modern Enterprise Header Structure */}
        <header className="mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"/>
            CENTRAL_RESOURCES_LOG
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent mb-4">
            Writing & Insights
          </h1>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light">
            An index tracking software engineering blueprints, clean architecture design principles, and production telemetry deep dives.
          </p>
        </header>

        {/* Clean Interface Interactive Layer */}
        <BlogDashboardClient initialBlogs={blogs} />
        
      </div>
    </main>
  );
}