import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getCategoryBySlug } from "@/lib/blog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

const CATEGORY = "weekly-roundup";

export async function generateStaticParams() {
  const posts = await getAllPosts(CATEGORY);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug, CATEGORY);
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Weekly Roundup`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug, CATEGORY);
  const category = getCategoryBySlug(CATEGORY);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Professional geometric pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236B7280' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative z-10 p-4 md:p-8 lg:p-24">
        <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 p-8 md:p-12">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            href={`/blog/${CATEGORY}`}
            className="text-primary hover:underline"
          >
            {category?.name || "Weekly Roundup"}
          </Link>
        </div>

        <header className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time className="font-medium">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <span className="text-primary/40">•</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{post.author}</span>
            </div>
            <span className="text-primary/40">•</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{post.readTime} min read</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full border border-primary/20 hover:border-primary/40 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div 
          className="blog-content max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-xl">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">
                {post.author}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Weekly Market Analyst
              </p>
            </div>
          </div>
        </footer>
        </article>
      </div>
    </main>
  );
}