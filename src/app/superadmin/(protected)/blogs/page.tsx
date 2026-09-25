"use client";

import React, { useEffect, useState } from "react";
import { FiFileText, FiCalendar, FiTag, FiFolder } from "react-icons/fi";

interface BlogSummary {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogSummaries() {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to load blog summaries:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogSummaries();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-black text-white min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Blog Articles
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold tracking-wide">
              MARKDOWN
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Direct file system storage &bull; <span className="text-neutral-500">src/app/content/blogs</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#0c0c0e] border border-neutral-800/80 rounded-xl flex items-center gap-2">
            <FiFolder className="text-neutral-400 text-sm" />
            <span className="text-xs font-mono text-neutral-300">
              Total Posts: <strong className="text-white font-bold">{blogs.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* BLOG CONTENT CONTAINER */}
      {loading ? (
        <div className="p-12 text-center bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent mb-3"></div>
          <p className="text-xs font-mono text-neutral-400">Scanning content directory for .md files...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-16 text-center bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl space-y-2">
          <FiFileText className="mx-auto text-3xl text-neutral-600 mb-2" />
          <h3 className="text-sm font-bold text-neutral-300">No Markdown Files Found</h3>
          <p className="text-xs font-mono text-neutral-500">
            Add .md or .mdx files into <span className="text-neutral-400">src/app/content/blogs</span> to view them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {blogs.map((blog) => (
            <div
              key={blog.slug}
              className="group p-6 bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-neutral-700/80 transition-all duration-200"
            >
              {/* MAIN METADATA */}
              <div className="space-y-3 max-w-4xl">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-neutral-100 group-hover:text-white transition-colors">
                    {blog.title}
                  </h3>
                  
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {blog.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-md flex items-center gap-1"
                        >
                          <FiTag className="text-[9px] text-neutral-500" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-sans">
                  {blog.excerpt || "No description provided in frontmatter."}
                </p>
              </div>

              {/* SLUG & DATE DETAILS */}
              <div className="shrink-0 flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-900 text-right font-mono">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-900/80 px-3 py-1.5 rounded-lg border border-neutral-800/60">
                  <FiCalendar className="text-emerald-400 text-xs" />
                  <span>{blog.date ? new Date(blog.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No Date"}</span>
                </div>
                <span className="text-[11px] text-neutral-500 mt-2 block font-mono">
                  {blog.slug}.md
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}