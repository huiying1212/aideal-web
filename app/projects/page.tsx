'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import projectsData from '@/data/projects.json'

export default function ProjectsPage() {
  const { t } = useLanguage()
  const { projects } = projectsData

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Page Header */}
      <header className="mb-16 animate-fade-in">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          {t('研究项目', 'Projects')}
        </h1>
        <p className="text-gray-500">{t('Projects', '研究项目')}</p>
      </header>

      {/* Projects Grid */}
      <div className="space-y-8">
        {projects.map((project) => (
          <article
            key={project.id}
            className="group grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 p-8 border border-gray-100 rounded-2xl hover:border-gray-200 hover:bg-gray-50/30 transition-all"
          >
            {/* Left: Image placeholder */}
            <div className="aspect-video md:aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Right: Content */}
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2 mb-3">
                {project.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <h2 className="text-xl font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                {project.title}
              </h2>

              <p className="mt-1 text-xs text-gray-400">{project.date}</p>

              <p className="mt-4 text-sm text-gray-600 leading-relaxed flex-1">
                {project.description.full}
              </p>

              <p className="mt-4 text-xs text-gray-400">
                <span className="text-gray-500">{t('作者', 'Authors')}:</span> {project.authors}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {t('查看论文', 'View Paper')}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
