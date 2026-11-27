/* eslint-disable no-undef */
"use client";

import ProjectFormModal from "@/app/components/ProjectFormModal";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectLink {
  label: string;
  url: string;
}

interface ClientInfo {
  name: string;
  company: string;
}

interface ArchitectureStep {
  stepNumber: number;
  title: string;
  description: string;
  techUsed: string[];
}

interface ProjectItem {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  status: string;
  thumbnailUrl: string;
  galleryImages?: string[];
  clientInfo?: ClientInfo;
  links: ProjectLink[];
  techStack: string[];
  architectureFlow?: ArchitectureStep[];
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    status: "Published",
    thumbnailUrl: "",
    galleryImagesText: "", // New: One image URL per line or comma-separated
    clientName: "",
    clientCompany: "",
    linksText: "",
    techStackText: "",
    architectureText: "",
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProjects(json.data);
        } else {
          toast.error("Failed to load projects.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading projects:", err);
        setLoading(false);
      });
  }, []);

  const handleOpenModal = (project?: ProjectItem) => {
    if (project) {
      setEditingSlug(project.slug || null);

      const archFormatted = project.architectureFlow
        ? project.architectureFlow
            .map(
              (step) =>
                `${step.title} | ${step.description} | ${
                  step.techUsed ? step.techUsed.join(", ") : ""
                }`,
            )
            .join("\n")
        : "";

      setForm({
        name: project.name,
        slug: project.slug,
        description: project.description,
        longDescription: project.longDescription || "",
        status: project.status || "Published",
        thumbnailUrl: project.thumbnailUrl || "",
        galleryImagesText: project.galleryImages
          ? project.galleryImages.join("\n")
          : "",
        clientName: project.clientInfo?.name || "",
        clientCompany: project.clientInfo?.company || "",
        linksText: project.links
          ? project.links.map((l) => `${l.label}: ${l.url}`).join("\n")
          : "",
        techStackText: project.techStack ? project.techStack.join(", ") : "",
        architectureText: archFormatted,
      });
    } else {
      setEditingSlug(null);
      setForm({
        name: "",
        slug: "",
        description: "",
        longDescription: "",
        status: "Published",
        thumbnailUrl: "",
        galleryImagesText: "",
        clientName: "",
        clientCompany: "",
        linksText: "",
        techStackText: "",
        architectureText: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    // Parse links string back to array
    const parsedLinks: ProjectLink[] = form.linksText
      .split("\n")
      .map((line) => {
        const [label, ...rest] = line.split(":");
        if (!label || rest.length === 0) return null;
        return { label: label.trim(), url: rest.join(":").trim() };
      })
      .filter(Boolean) as ProjectLink[];

    // Parse tech stack comma separated
    const parsedTechStack = form.techStackText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Parse gallery images (split by newline or comma)
    const parsedGalleryImages = form.galleryImagesText
      .split(/[\n,]/)
      .map((img) => img.trim())
      .filter(Boolean);

    // Parse architecture pipeline text lines into structured objects
    const parsedArchitecture: ArchitectureStep[] = form.architectureText
      .split("\n")
      .map((line, index) => {
        if (!line.trim()) return null;
        const parts = line.split("|").map((p) => p.trim());
        const title = parts[0] || `Phase ${index + 1}`;
        const description = parts[1] || "";
        const techUsed = parts[2]
          ? parts[2]
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        return {
          stepNumber: index + 1,
          title,
          description,
          techUsed,
        };
      })
      .filter(Boolean) as ArchitectureStep[];

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: form.description,
      longDescription: form.longDescription,
      status: form.status,
      thumbnailUrl:
        form.thumbnailUrl ||
        "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=1200&auto=format&fit=crop",
      galleryImages: parsedGalleryImages,
      clientInfo: {
        name: form.clientName,
        company: form.clientCompany,
      },
      links: parsedLinks,
      techStack: parsedTechStack,
      architectureFlow: parsedArchitecture,
    };

    try {
      if (editingSlug) {
        const res = await fetch(`/api/projects/${editingSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setProjects(
            projects.map((p) => (p.slug === editingSlug ? json.data : p)),
          );
          toast.success("Project updated successfully.");
        } else {
          toast.error(json.error || "Failed to update project.");
        }
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setProjects([json.data, ...projects]);
          toast.success("Project created successfully.");
        } else {
          toast.error(json.error || "Failed to create project.");
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("An error occurred while saving.");
    }
  };

  const handleDelete = async (slug?: string) => {
    if (!slug) return;
    if (!confirm("Are you sure you want to delete this deployment?")) return;

    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setProjects(projects.filter((p) => p.slug !== slug));
        toast.success("Project deleted.");
      } else {
        toast.error(json.error || "Failed to delete project.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An error occurred while deleting.");
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white">
            Project Showcase Control
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Manage deployments, client info, gallery images, architecture
            pipelines, and specs.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
        >
          + Add Deployment
        </button>
      </div>

      {loading ? (
        <p className="text-xs font-mono text-zinc-500 animate-pulse">
          Synchronizing fleet...
        </p>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl text-xs font-mono text-zinc-500">
          No records registered in database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((item) => (
            <div
              key={item.slug}
              className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 relative group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">
                    slug: /{item.slug}
                  </span>
                </div>
                <div className="flex gap-3 text-xs font-mono">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.slug)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {item.clientInfo?.company && (
                <p className="text-[11px] font-mono text-zinc-400">
                  Client:{" "}
                  <span className="text-zinc-200">{item.clientInfo.name}</span>{" "}
                  ({item.clientInfo.company})
                </p>
              )}

              <p className="text-xs text-zinc-400 line-clamp-2">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.techStack?.map((t, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {item.galleryImages && item.galleryImages.length > 0 && (
                <p className="text-[10px] font-mono text-blue-400">
                  🖼️ Gallery Images: {item.galleryImages.length} attached
                </p>
              )}

              {item.architectureFlow && item.architectureFlow.length > 0 && (
                <p className="text-[10px] font-mono text-amber-400">
                  ⚙️ Architecture Pipeline: {item.architectureFlow.length}{" "}
                  Phases configured
                </p>
              )}

              <div className="flex gap-4 text-[11px] font-mono text-emerald-400 pt-2 border-t border-zinc-900">
                <a
                  href={`/projects/${item.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-emerald-300"
                >
                  View Specs Page ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        editingSlug={editingSlug}
        form={form}
        setForm={setForm}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
