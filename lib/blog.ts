import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/blog");

export type Post = {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  tags: string[];
  readTime: number;
};

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    
    const { data, content } = matter(fileContents);
    
    const processedContent = await remark()
      .use(html)
      .process(content);
    
    const htmlContent = processedContent.toString();
    const stats = readingTime(content);
    
    return {
      slug,
      title: data.title,
      date: data.date,
      author: data.author || "Market Analyst",
      excerpt: data.excerpt,
      content: htmlContent,
      tags: data.tags || [],
      readTime: Math.ceil(stats.minutes),
    };
  } catch (error) {
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const slugs = fs.readdirSync(postsDirectory)
      .filter((filename) => filename.endsWith(".md"))
      .map((filename) => filename.replace(/\.md$/, ""));
    
    const posts = await Promise.all(
      slugs.map((slug) => getPostBySlug(slug))
    );
    
    return posts
      .filter((post): post is Post => post !== null)
      .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
  } catch (error) {
    return [];
  }
}