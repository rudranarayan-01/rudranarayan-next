import fs from "fs";
import path from "path";
import matter from "gray-matter";

const blogsDirectory = path.join(process.cwd(), "src", "app", "content", "blogs");

export interface BlogItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  content: string;
}

export function getAllBlogs(): BlogItem[] {
  if (!fs.existsSync(blogsDirectory)) return [];

  const fileNames = fs.readdirSync(blogsDirectory);

  const allBlogs = fileNames
    .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, "");
      const fullPath = path.join(blogsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Parse markdown metadata headers
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || "Untitled",
        excerpt: data.excerpt || "",
        date: data.date || "",
        tags: data.tags || [],
        content,
      };
    });

  // Sort blogs by newest date first
  return allBlogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}