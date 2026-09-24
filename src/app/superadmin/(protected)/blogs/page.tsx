"use client";

import React, { useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  status: "Published" | "Draft" | "Archived";
  featured: boolean;
  coverImage: string;
  publishedAt: string;
  views: number;
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "1",
    title: "Deploying Full-Stack Next.js and SQLite Apps on Render",
    slug: "deploying-nextjs-sqlite-render",
    excerpt: "A step-by-step walkthrough on configuring cross-origin requests, SQLite storage persistence, and dynamic environment keys.",
    category: "DevOps & Full Stack",
    readTime: "6 min read",
    status: "Published",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-02-14",
    views: 1240,
  },
  {
    id: "2",
    title: "Optimizing Custom Object Detection Models with OpenCV and YOLO",
    slug: "optimizing-yolo-opencv-surveillance",
    excerpt: "Integrating multi-model layers for behavior tracking, frame processing acceleration, and item detection in real-time.",
    category: "Computer Vision",
    readTime: "8 min read",
    status: "Published",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-01-28",
    views: 890,
  },
  {
    id: "3",
    title: "Designing Real-Time Generative AI Routing Workflows",
    slug: "designing-ai-routing-workflows",
    excerpt: "Architecting a dynamic task dispatcher for local service platforms using vector matching and conversational fallback logic.",
    category: "Artificial Intelligence",
    readTime: "4 min read",
    status: "Draft",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-04-02",
    views: 0,
  },
];

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "Full Stack",
    readTime: "5 min read",
    status: "Published" as BlogPost["status"],
    coverImage: "",
  });

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const generatedSlug =
      formData.slug.trim() ||
      formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const newBlog: BlogPost = {
      id: Date.now().toString(),
      title: formData.title,
      slug: generatedSlug,
      excerpt: formData.excerpt,
      category: formData.category,
      readTime: formData.readTime || "4 min read",
      status: formData.status,
      featured: false,
      coverImage: formData.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString().split("T")[0],
      views: 0,
    };

    setBlogs([newBlog, ...blogs]);
    setIsModalOpen(false);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      category: "Full Stack",
      readTime: "5 min read",
      status: "Published",
      coverImage: "",
    });
  };

  const handleDelete = (id: string) => {
    setBlogs(blogs.filter((b) => b.id !== id));
  };

  const toggleFeatured = (id: string) => {
    setBlogs(blogs.map((b) => (b.id === id ? { ...b, featured: !b.featured } : b)));
  };

  const toggleStatus = (id: string) => {
    setBlogs(
      blogs.map((b) => {
        if (b.id === id) {
          const nextStatus: BlogPost["status"] =
            b.status === "Published" ? "Draft" : b.status === "Draft" ? "Archived" : "Published";
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Article & Content Engine</h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Draft technical blogs, update dynamic metadata, manage publication status, and monitor article stats.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors w-fit font-mono"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Article</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["All", "Published", "Draft", "Archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "bg-zinc-950 text-zinc-400 border border-zinc-800/80 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="p-5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 group"
          >
            <div>
              {/* Image Preview using standard img tag to bypass Next Image loader restrictions */}
              <div className="relative h-40 w-full mb-4 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFeatured(blog.id)}
                    className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                      blog.featured ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-black/60 text-zinc-400 hover:text-white"
                    }`}
                    title="Toggle Featured"
                  >
                    ★
                  </button>
                </div>
              </div>

              {/* Status and Tag */}
              <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[10px]">
                <button
                  onClick={() => toggleStatus(blog.id)}
                  className={`px-2 py-0.5 rounded-md border font-semibold ${
                    blog.status === "Published"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : blog.status === "Draft"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400"
                  }`}
                >
                  {blog.status}
                </button>
                <span className="text-zinc-500">{blog.category}</span>
              </div>

              <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                {blog.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {blog.excerpt}
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <span>{blog.publishedAt}</span>
                <span>•</span>
                <span>{blog.readTime}</span>
              </div>
              <button
                onClick={() => handleDelete(blog.id)}
                className="hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Compose New Article</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building Scalable Microservices with Express"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Summary / Excerpt</label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}