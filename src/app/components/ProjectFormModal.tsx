/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export interface ProjectFormState {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  status: string;
  thumbnailUrl: string;
  galleryImagesText: string;
  clientName: string;
  clientCompany: string;
  linksText: string;
  techStackText: string;
  architectureText: string;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  editingSlug: string | null;
  form: ProjectFormState;
  setForm: React.Dispatch<React.SetStateAction<ProjectFormState>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProjectFormModal({
  isOpen,
  editingSlug,
  form,
  setForm,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const [uploadingTarget, setUploadingTarget] = useState<
    "thumbnail" | "gallery" | null
  >(null);

  if (!isOpen) return null;

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return [];

    const folderHint = form.name.trim() || form.slug.trim() || "General";
    const body = new FormData();
    body.append("folder", folderHint);
    Array.from(fileList).forEach((file) => body.append("files", file));

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body,
    });
    const json = await res.json();

    if (!res.ok || !json.success || !Array.isArray(json.urls)) {
      throw new Error(json.error || "Cloudinary upload failed.");
    }

    return json.urls as string[];
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploadingTarget("thumbnail");
      const urls = await uploadFiles(e.target.files);
      if (urls[0]) {
        setForm((prev) => ({ ...prev, thumbnailUrl: urls[0] }));
        toast.success("Thumbnail uploaded to Cloudinary.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload thumbnail.");
    } finally {
      setUploadingTarget(null);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploadingTarget("gallery");
      const urls = await uploadFiles(e.target.files);
      if (urls.length > 0) {
        setForm((prev) => {
          const existing = prev.galleryImagesText
            .split(/[\n,]/)
            .map((item) => item.trim())
            .filter(Boolean);
          return {
            ...prev,
            galleryImagesText: [...existing, ...urls].join("\n"),
          };
        });
        toast.success(`Uploaded ${urls.length} gallery image(s) to Cloudinary.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload gallery images.");
    } finally {
      setUploadingTarget(null);
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            {editingSlug !== null
              ? "Edit Deployment Record"
              : "Add New Deployment Record"}
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">
            Folder: Portfolio/{(form.name.trim() || form.slug.trim() || "General")}
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Project Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            />
            <input
              type="text"
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Client Name (e.g. Shiv Kukreja)"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Client Company (e.g. HouseXpertz Delhi)"
              value={form.clientCompany}
              onChange={(e) =>
                setForm({ ...form, clientCompany: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
            />
          </div>

          <textarea
            rows={2}
            placeholder="Short Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-sans"
          />

          <textarea
            rows={3}
            placeholder="Detailed Implementation Overview (long description)"
            value={form.longDescription}
            onChange={(e) =>
              setForm({ ...form, longDescription: e.target.value })
            }
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-sans"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
            >
              <option value="Published">Published</option>
              <option value="In Development">In Development</option>
              <option value="Archived">Archived</option>
            </select>

            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Thumbnail Image URL"
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm({ ...form, thumbnailUrl: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
              <label className="px-3 py-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl hover:bg-emerald-500/25 cursor-pointer shrink-0 flex items-center">
                {uploadingTarget === "thumbnail" ? "..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingTarget !== null}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Gallery Images Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">
                Gallery Images (URLs or Upload Files)
              </label>
              <label className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/40 text-blue-300 rounded-lg hover:bg-blue-500/25 cursor-pointer text-[10px]">
                {uploadingTarget === "gallery"
                  ? "Uploading..."
                  : "+ Upload Images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={uploadingTarget !== null}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={3}
              placeholder={`https://images.unsplash.com/photo-...\nhttps://images.unsplash.com/photo-...`}
              value={form.galleryImagesText}
              onChange={(e) =>
                setForm({ ...form, galleryImagesText: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-mono text-[11px]"
            />
          </div>

          <textarea
            rows={2}
            placeholder="Action Links (Format -> Label: https://url.com, one per line)"
            value={form.linksText}
            onChange={(e) => setForm({ ...form, linksText: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-mono text-[11px]"
          />

          <input
            type="text"
            placeholder="Tech Stack (Comma-separated, e.g. React, Next.js, Node.js)"
            value={form.techStackText}
            onChange={(e) =>
              setForm({ ...form, techStackText: e.target.value })
            }
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
          />

          {/* Architecture Pipeline Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
              Architecture Pipeline (Format: Title | Description | Tech1, Tech2)
            </label>
            <textarea
              rows={4}
              placeholder="Phase Title | Step breakdown description | Next.js, TypeScript"
              value={form.architectureText}
              onChange={(e) =>
                setForm({ ...form, architectureText: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-mono text-[11px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingTarget !== null}
              className="px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 disabled:opacity-50"
            >
              {uploadingTarget !== null ? "Uploading..." : "Save Deployment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}