'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import projectsData from '@/data/projects.json'

export default function ProjectsPage() {
  const { t } = useLanguage()
  const { projects } = projectsData

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      {/* Page Header */}
      <header className="mb-20 animate-fade-in">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
          {t('Projects', 'Projects')}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight">
          {t('研究项目', 'Research Projects')}
        </h1>
      </header>

      {/* Projects Grid */}
      <div className="space-y-6">
        {projects.map((project) => (
          <article
            key={project.id}
            className="group grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 p-8 border border-zinc-100 rounded-3xl hover:border-zinc-200 transition-all duration-300 bg-white card-hover"
          >
            {/* Left: Image placeholder */}
            <div className="aspect-[4/3] lg:aspect-square bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>

            {/* Right: Content */}
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2 mb-4">
                {project.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-zinc-100 text-zinc-500 text-[11px] font-medium rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <h2 className="text-xl font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                {project.title}
              </h2>

              <p className="mt-1 text-xs text-zinc-400 font-mono">{project.date}</p>

              <p className="mt-5 text-sm text-zinc-600 leading-relaxed flex-1">
                {project.description.full}
              </p>

              <p className="mt-5 text-xs text-zinc-400">
                <span className="text-zinc-500">{t('作者', 'Authors')}:</span> {project.authors}
              </p>

              <div className="mt-5 pt-5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[11px] text-zinc-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
                  >
                    {t('查看论文', 'View Paper')}
                    <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
