/* eslint-disable no-undef */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface ProjectLink {
  label: string;
  url: string;
}

interface ArchitectureStep {
  stepNumber: number;
  title: string;
  description: string;
  techUsed: string[];
}

interface ProjectDetails {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  status: string;
  thumbnailUrl?: string;
  galleryImages?: string[];
  links?: ProjectLink[];
  architectureFlow?: ArchitectureStep[];
  clientInfo?: {
    name: string;
    company: string;
  };
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const { slug } = params;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchProjectDetails() {
      try {
        const res = await fetch(`/api/projects/${slug}`);
        const json = await res.json();

        if (json.success) {
          setProject(json.data);
          if (json.data.thumbnailUrl) {
            setActiveImage(json.data.thumbnailUrl);
          }
        } else {
          toast.error("Project not found.");
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-emerald-400 animate-pulse tracking-widest uppercase shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Synchronizing Project Telemetry...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-32 text-center space-y-4 max-w-md mx-auto">
        <div className="p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl backdrop-blur-md space-y-4">
          <h1 className="text-xl font-bold text-white font-mono">Deployment Not Found</h1>
          <p className="text-xs text-zinc-400 font-mono">The requested slug does not match any active record.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-zinc-950 border border-zinc-800 text-xs text-emerald-400 rounded-xl font-mono hover:bg-zinc-800 transition-colors">
            ← Return to Fleet Overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article key={project.slug} className="space-y-10 pb-16">
      
      {/* Top Header & Telemetry Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 animate-slide-left">
        <Link href="/" className="text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-2 group w-fit">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Fleet Overview
        </Link>
        <div className="flex items-center gap-3">
          {project.clientInfo?.company && (
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-full">
              Client: <strong className="text-zinc-200">{project.clientInfo.company}</strong>
            </span>
          )}
          <span className={`text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-widest ${
            project.status === "Published" 
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
              : "text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          }`}>
            ● {project.status}
          </span>
        </div>
      </div>

      {/* Hero Title & Description */}
      <div className="space-y-4 animate-slide-left delay-100">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 tracking-tight font-sans">
          {project.name}
        </h1>
        <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-sans max-w-3xl">
          {project.description}
        </p>
      </div>

      {/* Action Links Bar */}
      {project.links && project.links.length > 0 && (
        <div className="flex flex-wrap gap-3 animate-fade-up delay-200">
          {project.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/80 text-xs font-mono text-emerald-300 rounded-xl transition-all shadow-lg flex items-center gap-2.5 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
              <span>{link.label}</span>
              <span className="text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </a>
          ))}
        </div>
      )}

      {/* Main Feature Banner / Active Image Previewer */}
      {project.thumbnailUrl && (
        <div className="space-y-3 animate-fade-up delay-200">
          <div className="w-full h-80 sm:h-[420px] rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 relative shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src={activeImage || project.thumbnailUrl} 
              alt={project.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              onError={(e) => {
                // Graceful fallback if image URL is broken
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute bottom-4 left-4 z-20 px-3 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-300 backdrop-blur-md">
              Interactive Preview Mode
            </div>
          </div>

          {/* Gallery Thumbnails Selector */}
          {project.galleryImages && project.galleryImages.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setActiveImage(project.thumbnailUrl || null)}
                className={`w-20 h-14 rounded-lg overflow-hidden border transition-all shrink-0 ${
                  activeImage === project.thumbnailUrl ? "border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "border-zinc-800 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={project.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
              {project.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border transition-all shrink-0 ${
                    activeImage === img ? "border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "border-zinc-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tech Stack Matrix */}
      <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-4 backdrop-blur-md animate-fade-up delay-300 shadow-xl">
        <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,1)]" />
          Tech Stack & Architecture Matrix
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.techStack?.map((tech, idx) => (
            <span key={idx} className="text-xs font-mono px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-zinc-300 shadow-inner">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Long Implementation Overview */}
      {project.longDescription && (
        <div className="p-6 sm:p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-4 backdrop-blur-md animate-fade-up delay-300 shadow-xl">
          <h2 className="text-xs font-bold text-white font-mono uppercase tracking-widest border-b border-zinc-800/80 pb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)]" />
            System Implementation Breakdown
          </h2>
          <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line space-y-4">
            {project.longDescription}
          </div>
        </div>
      )}

      {/* Architecture Data Flow Section */}
      {project.architectureFlow && project.architectureFlow.length > 0 && (
        <div className="p-6 sm:p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-6 backdrop-blur-md animate-fade-up delay-400 shadow-xl">
          <div>
            <h2 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,1)]" />
              Architecture & Execution Pipeline
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">Sequential system microservice workflow</p>
          </div>

          <div className="space-y-6 border-l-2 border-zinc-800/80 pl-5 ml-2">
            {project.architectureFlow.map((step) => (
              <div key={step.stepNumber} className="relative pl-4 space-y-2.5 group">
                <div className="absolute -left-[28px] top-1 w-4 h-4 rounded-full bg-zinc-950 border-2 border-amber-400 group-hover:bg-amber-400 group-hover:shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all" />
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                    PHASE 0{step.stepNumber}
                  </span>
                  <h3 className="text-sm font-bold text-white font-sans">{step.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">{step.description}</p>
                {step.techUsed && step.techUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {step.techUsed.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800/80 text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}