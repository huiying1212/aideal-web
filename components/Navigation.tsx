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
    <header className="sticky top-0 z-50 bg-[#fafafa]/90 backdrop-blur-xl border-b border-zinc-100/80">
      <nav className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="group">
            <h1 className="text-lg font-medium tracking-tight text-zinc-900">
              <span className="font-mono">ai</span>
              <span className="font-mono text-zinc-300">{'{'}</span>
              <span className="font-mono">DEAL</span>
              <span className="font-mono text-zinc-300">{'}'}</span>
              <span className="text-zinc-400 font-normal"> Studio</span>
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5 tracking-wide">
              {lang === 'zh' ? siteData.name.subtitle.zh : siteData.name.subtitle.en}
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {siteData.navigation.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-4 py-2 text-sm transition-all duration-300 rounded-lg ${
                  pathname === item.path
                    ? 'text-zinc-900 font-medium'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {lang === 'zh' ? item.name.zh : item.name.en}
                {pathname === item.path && (
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-zinc-900 rounded-full" />
                )}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-zinc-200">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-2 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 text-zinc-600"
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
          <ul className="md:hidden mt-4 pt-4 border-t border-zinc-100 space-y-1">
            {siteData.navigation.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-3 px-3 text-sm transition-all rounded-lg ${
                    pathname === item.path
                      ? 'text-zinc-900 font-medium bg-zinc-100'
                      : 'text-zinc-500 hover:bg-zinc-50'
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
