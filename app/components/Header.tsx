"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBlogDropdownOpen, setIsBlogDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Calculator" },
    { href: "/blog", label: "Market Blog", hasDropdown: true },
  ];

  const blogSubLinks = [
    { href: "/blog/weekly-roundup", label: "Weekly Roundup" },
    { href: "/blog/daily-recap", label: "Daily Recap" },
    { href: "/blog/stock-picks", label: "Stock Picks" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Compound Calculator
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.hasDropdown ? (
                <div key={link.href} className="relative">
                  <button
                    onMouseEnter={() => setIsBlogDropdownOpen(true)}
                    onMouseLeave={() => setIsBlogDropdownOpen(false)}
                    className={`font-medium transition-colors flex items-center gap-1 ${
                      isActive(link.href)
                        ? "text-primary"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    <Link href={link.href}>{link.label}</Link>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isBlogDropdownOpen && (
                    <div
                      onMouseEnter={() => setIsBlogDropdownOpen(true)}
                      onMouseLeave={() => setIsBlogDropdownOpen(false)}
                      className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                    >
                      {blogSubLinks.map((subLink) => (
                        <Link
                          key={subLink.href}
                          href={subLink.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                          {subLink.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  className={`block py-2 font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
                {link.hasDropdown && blogSubLinks.map((subLink) => (
                  <Link
                    key={subLink.href}
                    href={subLink.href}
                    className="block py-2 pl-4 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {subLink.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}