import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";

const contentDirectory = path.join(process.cwd(), "content");
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
  category: string;
};

export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "weekly-roundup",
    name: "Weekly Roundup",
    description: "Weekly market updates, analysis, and insights to help you make informed investment decisions."
  },
  {
    slug: "daily-recap",
    name: "Daily Recap",
    description: "Daily market recaps covering key events, price movements, and trading opportunities."
  },
  {
    slug: "stock-picks",
    name: "Stock Picks",
    description: "In-depth analysis and recommendations for individual stocks with growth potential."
  }
];

export async function getPostBySlug(slug: string, category?: string): Promise<Post | null> {
  try {
    let fullPath: string;
    let postCategory = category || "weekly-roundup";
    
    // First try to find in the specified category
    if (category) {
      const categoryPath = path.join(contentDirectory, category, `${slug}.md`);
      if (fs.existsSync(categoryPath)) {
        fullPath = categoryPath;
      } else {
        // If not found in specified category, return null
        return null;
      }
    } else {
      // If no category specified, search all categories
      for (const cat of blogCategories) {
        const categoryPath = path.join(contentDirectory, cat.slug, `${slug}.md`);
        if (fs.existsSync(categoryPath)) {
          fullPath = categoryPath;
          postCategory = cat.slug;
          break;
        }
      }
      // Also check the old blog directory for backward compatibility
      if (!fullPath!) {
        const oldPath = path.join(postsDirectory, `${slug}.md`);
        if (fs.existsSync(oldPath)) {
          fullPath = oldPath;
          postCategory = "weekly-roundup";
        } else {
          return null;
        }
      }
    }
    
    const fileContents = fs.readFileSync(fullPath!, "utf8");
    
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
      category: data.category || postCategory,
    };
  } catch {
    return null;
  }
}

export async function getAllPosts(category?: string): Promise<Post[]> {
  try {
    let allPosts: Post[] = [];
    
    if (category) {
      // Get posts from specific category
      const categoryDir = path.join(contentDirectory, category);
      if (fs.existsSync(categoryDir)) {
        const slugs = fs.readdirSync(categoryDir)
          .filter((filename) => filename.endsWith(".md"))
          .map((filename) => filename.replace(/\.md$/, ""));
        
        const posts = await Promise.all(
          slugs.map((slug) => getPostBySlug(slug, category))
        );
        
        allPosts = posts.filter((post): post is Post => post !== null);
      }
    } else {
      // Get posts from all categories
      for (const cat of blogCategories) {
        const categoryDir = path.join(contentDirectory, cat.slug);
        if (fs.existsSync(categoryDir)) {
          const slugs = fs.readdirSync(categoryDir)
            .filter((filename) => filename.endsWith(".md"))
            .map((filename) => filename.replace(/\.md$/, ""));
          
          const posts = await Promise.all(
            slugs.map((slug) => getPostBySlug(slug, cat.slug))
          );
          
          allPosts = allPosts.concat(posts.filter((post): post is Post => post !== null));
        }
      }
      
      // Also include posts from old blog directory for backward compatibility
      if (fs.existsSync(postsDirectory)) {
        const slugs = fs.readdirSync(postsDirectory)
          .filter((filename) => filename.endsWith(".md"))
          .map((filename) => filename.replace(/\.md$/, ""));
        
        const posts = await Promise.all(
          slugs.map((slug) => {
            const fullPath = path.join(postsDirectory, `${slug}.md`);
            if (fs.existsSync(fullPath)) {
              return getPostBySlug(slug);
            }
            return null;
          })
        );
        
        allPosts = allPosts.concat(posts.filter((post): post is Post => post !== null));
      }
    }
    
    return allPosts
      .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
  } catch {
    return [];
  }
}

export function getCategoryBySlug(slug: string): BlogCategory | undefined {
  return blogCategories.find(cat => cat.slug === slug);
}