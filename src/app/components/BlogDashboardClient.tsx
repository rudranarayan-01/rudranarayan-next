"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

interface BlogItem {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    tags: string[];
    content: string;
}

export default function BlogDashboardClient({ initialBlogs }: { initialBlogs: BlogItem[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Extract all unique tags dynamically across all posts
    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        initialBlogs.forEach((blog) => blog.tags?.forEach((tag) => tagsSet.add(tag)));
        return Array.from(tagsSet);
    }, [initialBlogs]);

    // Premium Real-time Filter Matrix
    const filteredBlogs = useMemo(() => {
        return initialBlogs.filter((blog) => {
            const matchesSearch =
                blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = selectedTag ? blog.tags?.includes(selectedTag) : true;
            return matchesSearch && matchesTag;
        });
    }, [initialBlogs, searchQuery, selectedTag]);

    // Separate the very latest post to display in a Premium Full-Width Layout
    const featuredBlog = initialBlogs[0];
    const secondaryBlogs = filteredBlogs.filter((b) => b.slug !== (selectedTag ? null : featuredBlog?.slug));

    return (
        <div className="max-w-6xl mx-auto">
            {/* Search & Tag Filter Hub */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-12 pb-6 border-b border-neutral-900">
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all duration-300 ${selectedTag === null
                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                            }`}
                    >
                        ALL_POSTS
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all duration-300 ${selectedTag === tag
                                    ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                    : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                                }`}
                        >
                            #{tag.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Search systems & write-ups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-600 text-sm text-white rounded-xl px-4 py-2 outline-none transition-all placeholder:text-neutral-600 focus:shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                    />
                </div>
            </div>

            {/* Conditional Layout Strategy */}
            {filteredBlogs.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-neutral-900 rounded-3xl bg-[#050505]">
                    <p className="text-neutral-500 font-mono text-sm">NO_COMPATIBLE_RECORDS_FOUND</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* PREMIUM HERO FEATURE SLOT (Only displays when no tag is active or search query is empty) */}
                    {!selectedTag && !searchQuery && featuredBlog && (
                        <Link href={`/blog/${featuredBlog.slug}`} className="block group">
                            <div className="relative bg-[#0a0a0a] border border-neutral-800 group-hover:border-neutral-700 rounded-3xl p-8 md:p-12 transition-all duration-500 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(59,130,246,0.03)]">
                                {/* Visual Glow Layer */}
                                <div className="absolute -right-24 -top-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                    <div className="lg:col-span-7 space-y-4">
                                        <div className="flex items-center gap-3 text-xs font-mono text-blue-500">
                                            <span className="px-2 py-0.5 bg-blue-950/50 border border-blue-900/50 rounded">FEATURED_INSIGHT</span>
                                            <span>•</span>
                                            <time>{new Date(featuredBlog.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-neutral-100 group-hover:text-white transition duration-300">
                                            {featuredBlog.title}
                                        </h2>
                                        <p className="text-neutral-400 text-sm md:text-base leading-relaxed line-clamp-3">
                                            {featuredBlog.excerpt}
                                        </p>
                                        <div className="pt-2 flex items-center text-sm font-medium text-neutral-300 group-hover:text-white transition-colors gap-1">
                                            Launch Article Deep-Dive <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                        </div>
                                    </div>

                                    <div className="hidden lg:flex lg:col-span-5 h-full min-h-[180px] bg-neutral-900/40 border border-neutral-800/60 rounded-2xl flex-col justify-center p-6 font-mono relative overflow-hidden">
                                        <div className="text-[11px] text-neutral-600 absolute top-3 left-4">SYSTEM_TELEMETRY</div>
                                        <div className="space-y-2">
                                            <div className="text-xs text-neutral-400 truncate"><span className="text-neutral-600">SLUG://</span> {featuredBlog.slug}</div>
                                            <div className="text-xs text-neutral-400 flex gap-1"><span className="text-neutral-600">TAGS://</span> {featuredBlog.tags.map(t => `#${t}`).join(', ')}</div>
                                            <div className="text-xs text-green-500/80 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE_COMPILE_SUCCESSFUL</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* GRID ARCHITECTURE FOR NEXT REMAINING POSTS */}
                    {secondaryBlogs.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {secondaryBlogs.map((blog) => (
                                <article
                                    key={blog.slug}
                                    className="group relative bg-[#0a0a0a]/60 border border-neutral-900 hover:border-neutral-800 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:bg-[#0a0a0a] shadow-xl"
                                >
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-4">
                                            <time dateTime={blog.date}>
                                                {new Date(blog.date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </time>
                                            <div className="flex gap-1.5">
                                                {blog.tags.slice(0, 2).map((tag) => (
                                                    <span key={tag} className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-400 text-[10px]">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-semibold text-neutral-200 group-hover:text-white transition duration-200 mb-2 line-clamp-2">
                                            {blog.title}
                                        </h3>

                                        <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mb-6 line-clamp-3 font-light">
                                            {blog.excerpt}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/blog/${blog.slug}`}
                                        className="inline-flex items-center text-xs font-medium text-neutral-400 group-hover:text-white transition-colors mt-auto gap-1"
                                    >
                                        Read Post <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}