'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import siteData from '@/data/site.json'

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { lang } = useLanguage()

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa]/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="group">
            <h1 className="text-lg font-medium tracking-tight">
              <span className="font-mono text-gray-900">ai</span>
              <span className="font-mono text-gray-400">{'{'}</span>
              <span className="font-mono text-gray-900">DEAL</span>
              <span className="font-mono text-gray-400">{'}'}</span>
              <span className="text-gray-900"> Studio</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === 'zh' ? siteData.name.subtitle.zh : siteData.name.subtitle.en}
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {siteData.navigation.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`text-sm transition-colors ${
                      pathname === item.path
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {lang === 'zh' ? item.name.zh : item.name.en}
                  </Link>
                </li>
              ))}
            </ul>
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-2"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <ul className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-3">
            {siteData.navigation.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 text-sm transition-colors ${
                    pathname === item.path
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {lang === 'zh' ? item.name.zh : item.name.en}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  )
}
