import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogs } from "@/lib/blogs";
import { marked } from "marked";
import Script from "next/script";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const blogs = getAllBlogs();
  const blog = blogs.find((b) => b.slug === resolvedParams.slug);

  if (!blog) return {};

  return {
    title: `${blog.title} | Tech Insights`,
    description: blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const blogs = getAllBlogs();
  const blog = blogs.find((b) => b.slug === resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  // Premium Markdown Compiler Tuning
  const renderer = new marked.Renderer();

  // Type-safe Heading interceptor with clean fallback parsing
  renderer.heading = function (...args: any[]) {
    let text = "";
    let level = 2;

    if (args[0] && typeof args[0] === 'object') {
      text = args[0].text || "";
      level = args[0].level || 2;
    } else {
      text = args[0] || "";
      level = args[1] || 2;
    }

    const escapedText = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") 
      .replace(/\s+/g, "-");    

    return `
      <h${level} id="${escapedText}" class="group relative">
        <a href="#${escapedText}" class="absolute -left-5 opacity-0 group-hover:opacity-40 transition-opacity text-neutral-400 font-normal no-underline">#</a>
        ${text}
      </h${level}>
    `;
  };

  // Premium framing and alignment handler for responsive image blocks
  renderer.image = function ({ href, title, text }) {
    return `
      <div class="my-10 flex flex-col items-center justify-center gap-2 group/img">
        <div class="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/30 p-2 transition-all duration-500 group-hover/img:border-neutral-700 shadow-2xl w-full">
          <img 
            src="${href}" 
            alt="${text || ""}" 
            title="${title || ""}" 
            class="max-h-[480px] w-full object-contain rounded-xl transition-transform duration-700 group-hover/img:scale-[1.01]" 
            loading="lazy"
          />
        </div>
        ${text ? `<span class="text-xs font-mono text-neutral-500 tracking-tight mt-2 text-center max-w-md">${text}</span>` : ""}
      </div>
    `;
  };

  const htmlContent = marked.parse(blog.content, { renderer });

  return (
    <article id="blog-root" className="min-h-screen bg-black text-white py-24 px-4 md:px-16 relative selection:bg-neutral-800 selection:text-white scroll-smooth">

      {/* High-End Micro-Interaction: Reading Progress Visual Layer */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-neutral-900 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 w-full transform origin-left transition-transform duration-100"
          id="reading-progress-bar"
        />
      </div>

      <div className="max-w-3xl mx-auto relative">

        {/* Navigation Breadcrumb Layer */}
        <nav className="mb-16">
          <Link
            href="/blog"
            className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors gap-2 group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
            SYS_RETURN_TO_DASHBOARD
          </Link>
        </nav>

        {/* Premium Core Editorial Header */}
        <header className="mb-14 border-b border-neutral-900 pb-12">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-500 mb-6">
            <time dateTime={blog.date} className="text-neutral-400" suppressHydrationWarning>
              {new Date(blog.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC"
              })}
            </time>
            <span>•</span>
            <div className="flex gap-1.5">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-neutral-950 border border-neutral-800/80 rounded text-neutral-400 text-[10px]"
                >
                  #{tag.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-100 leading-[1.15] mb-6 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            {blog.title}
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 font-light leading-relaxed border-l-2 border-neutral-800 pl-4 italic">
            {blog.excerpt}
          </p>
        </header>

        {/* High-End Typography Markdown Body Layout */}
        <section
          className="prose prose-invert max-w-none md:prose-lg
            prose-headings:text-neutral-100 prose-headings:font-semibold tracking-tight prose-headings:scroll-mt-24
            prose-p:text-neutral-400 prose-p:leading-relaxed prose-p:font-light
            prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-a:transition-colors prose-a:underline-offset-4
            prose-strong:text-white prose-strong:font-semibold
            prose-blockquote:border-l-blue-500 prose-blockquote:bg-neutral-950/40 prose-blockquote:py-1 prose-blockquote:pr-4 prose-blockquote:rounded-r-xl
            prose-code:text-sky-400 prose-code:bg-neutral-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#050505] prose-pre:border prose-pre:border-neutral-900 prose-pre:rounded-2xl prose-pre:p-5 prose-pre:shadow-2xl"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Premium Footer Author Block */}
        <footer className="mt-24 pt-12 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-bold text-neutral-300 text-xs shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              R
            </div>
            <div>
              <h4 className="text-sm font-medium text-neutral-300">Rudranarayan Sahu</h4>
              <p className="text-xs font-mono text-neutral-500">Full Stack Engineer & AI Systems Architect</p>
            </div>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-4">
            <a
              href="#blog-root"
              className="hidden md:inline-flex items-center justify-center h-11 px-4 bg-neutral-950 border border-neutral-900 rounded-xl text-xs font-mono text-neutral-400 hover:text-white hover:border-neutral-700 transition-all duration-300"
            >
              ↑ BACK_TO_TOP
            </a>

            <Link
              href="/"
              className="flex-1 sm:flex-initial text-center px-6 py-3 bg-neutral-950 hover:bg-white text-neutral-400 hover:text-black border border-neutral-900 hover:border-white rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow-xl"
            >
              VIEW PORTFOLIO
            </Link>
          </div>
        </footer>

        {/* PREMIUM PERSISTENT BACK TO TOP MICRO-CONTROLLER CARD */}
        <div id="floating-back-to-top" className="fixed bottom-8 right-8 z-40 transform translate-y-20 opacity-0 transition-all duration-500 pointer-events-none">
          <a
            href="#blog-root"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white transition-all duration-300 shadow-2xl"
            title="Return to structural start node"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </a>
        </div>

      </div>

      {/* SINGLE UNIFIED CLIENT ENGINE LOGIC RUNNING SAFELY AFTER INTERACTIVE LEVEL IS REACHED */}
      <Script id="reading-progress-engine" strategy="afterInteractive">
        {`
          const initialBar = document.getElementById('reading-progress-bar');
          if (initialBar) {
            initialBar.style.transform = 'scaleX(0)';
          }

          window.addEventListener('scroll', () => {
            const bar = document.getElementById('reading-progress-bar');
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (bar && totalHeight > 0) {
              const progress = (window.scrollY / totalHeight);
              bar.style.transform = 'scaleX(' + progress + ')';
            }

            const topButton = document.getElementById('floating-back-to-top');
            if (topButton) {
              if (window.scrollY > 400) {
                topButton.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
                topButton.classList.add('translate-y-0', 'opacity-100');
              } else {
                topButton.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
                topButton.classList.remove('translate-y-0', 'opacity-100');
              }
            }
          });
        `}
      </Script>
    </article>
  );
}