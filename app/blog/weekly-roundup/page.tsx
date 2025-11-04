import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getCategoryBySlug } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Weekly Market Roundup | Compound Interest Calculator",
  description: "Weekly market updates, analysis, and insights to help you make informed investment decisions.",
};

export default async function WeeklyRoundupPage() {
  const category = getCategoryBySlug("weekly-roundup");
  const posts = await getAllPosts("weekly-roundup");

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Professional grid pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236B7280' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative z-10 p-4 md:p-8 lg:p-24">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
            {category?.name || "Weekly Roundup"}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            {category?.description || "Weekly market updates and analysis"}
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.slug} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                <Link href={`/blog/${post.slug}`} className="block h-full p-6">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mt-2 mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {post.readTime} min read
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No weekly roundup posts yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}