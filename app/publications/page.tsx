'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import publicationsData from '@/data/publications.json'

export default function PublicationsPage() {
  const { t } = useLanguage()
  const { publications } = publicationsData

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      {/* Page Header */}
      <header className="mb-20 animate-fade-in">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
          {t('Publications', 'Publications')}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight">
          {t('学术发表', 'Publications')}
        </h1>
      </header>

      {/* Publications by Year */}
      <div className="space-y-20">
        {publications.map((yearGroup) => (
          <section key={yearGroup.year}>
            <div className="sticky top-20 z-10 py-3 bg-[#fafafa]/90 backdrop-blur-sm mb-8">
              <h2 className="text-4xl font-mono font-light text-zinc-200">
                {yearGroup.year}
              </h2>
            </div>
            <div className="space-y-4 pl-6 border-l-2 border-zinc-100">
              {yearGroup.items.map((pub, index) => (
                <article
                  key={index}
                  className="relative pl-8 before:absolute before:left-[-9px] before:top-2 before:w-4 before:h-4 before:bg-white before:border-2 before:border-zinc-200 before:rounded-full hover:before:border-zinc-400 hover:before:bg-zinc-50 transition-all duration-300"
                >
                  <div className="group p-5 rounded-xl hover:bg-zinc-50 transition-all duration-300">
                    <h3 className="text-base font-medium text-zinc-900 leading-snug group-hover:text-zinc-600 transition-colors duration-300">
                      {pub.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      {pub.authors}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400 font-mono">
                      {pub.venue}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {pub.link && (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-zinc-500 hover:text-zinc-700 transition-colors duration-300"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Paper
                        </a>
                      )}
                      {'pdf' in pub && pub.pdf && (
                        <a
                          href={pub.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-red-500 hover:text-red-700 transition-colors duration-300"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          PDF
                        </a>
                      )}
                      {'award' in pub && pub.award && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          🏆 {pub.award}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
