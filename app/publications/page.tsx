'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import publicationsData from '@/data/publications.json'

export default function PublicationsPage() {
  const { t } = useLanguage()
  const { publications } = publicationsData

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Page Header */}
      <header className="mb-16 animate-fade-in">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          {t('学术发表', 'Publications')}
        </h1>
        <p className="text-gray-500">{t('Publications', '学术发表')}</p>
      </header>

      {/* Publications by Year */}
      <div className="space-y-16">
        {publications.map((yearGroup) => (
          <section key={yearGroup.year}>
            <h2 className="text-2xl font-mono font-medium text-gray-300 mb-6 sticky top-20 bg-[#fafafa] py-2">
              {yearGroup.year}
            </h2>
            <div className="space-y-6 pl-4 border-l border-gray-100">
              {yearGroup.items.map((pub, index) => (
                <article
                  key={index}
                  className="relative pl-6 before:absolute before:left-[-5px] before:top-2 before:w-2 before:h-2 before:bg-gray-200 before:rounded-full hover:before:bg-gray-400 transition-all"
                >
                  <div className="group">
                    <h3 className="text-base font-medium text-gray-900 leading-snug">
                      {pub.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {pub.authors}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {pub.venue}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      {pub.link && (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          DOI/Link ↗
                        </a>
                      )}
                      {'award' in pub && pub.award && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded">
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
