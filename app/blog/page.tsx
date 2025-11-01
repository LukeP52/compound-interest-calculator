import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Weekly Market Blog | Compound Interest Calculator",
  description: "Weekly market updates, analysis, and insights to help you make informed investment decisions.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <main className="min-h-screen relative">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-green-200 to-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative z-10 p-4 md:p-8 lg:p-24">
        <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
          Weekly Market Updates
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
          Stay informed with our weekly analysis of market trends, investment opportunities, and financial insights.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary-dark"></div>
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
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No blog posts yet. Check back soon for our first weekly market update!
            </p>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}