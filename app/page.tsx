'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import siteData from '@/data/site.json'
import projectsData from '@/data/projects.json'
import publicationsData from '@/data/publications.json'

export default function Home() {
  const { lang, t } = useLanguage()
  const recentProjects = projectsData.projects.slice(0, 4)
  
  // Get the 3 most recent publications
  const recentPublications = publicationsData.publications
    .flatMap(yearGroup => 
      yearGroup.items.map(item => ({
        ...item,
        year: yearGroup.year
      }))
    )
    .slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-36">
        <div className="max-w-3xl">
          <p className="text-sm text-zinc-400 mb-6 animate-fade-in">
            {t('南方科技大学 · 创新创意设计学院', 'SUSTech · School of Design')}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-zinc-900 leading-[1.1] tracking-tight animate-fade-in">
            {t('我们是', 'We are')}{' '}
            <span className="gradient-text">
              <span className="font-mono">ai{'{'}</span>DEAL<span className="font-mono">{'}'}</span>
            </span>
            <span className="text-zinc-300"> Studio</span>
          </h1>
          <p className="mt-8 text-lg text-zinc-500 leading-relaxed max-w-2xl animate-fade-in-delay-1">
            {lang === 'zh' ? siteData.description.zh : siteData.description.en}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-delay-2">
            <Link
              href="/projects"
              className="inline-flex items-center px-6 py-3 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-900/20"
            >
              {t('查看项目', 'View Projects')}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/opportunities"
              className="inline-flex items-center px-6 py-3 border border-zinc-200 text-zinc-700 text-sm font-medium rounded-full hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300"
            >
              {t('加入我们', 'Join Us')}
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="border-t border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-10">
            {t('最新动态', 'Latest News')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPublications.map((item, index) => (
              <article
                key={index}
                className="group p-6 bg-zinc-50 rounded-2xl hover:bg-zinc-100/80 transition-all duration-300 card-hover"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-medium text-emerald-600">
                    {t('论文录用', 'Accepted')}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-3 font-mono">{item.venue}</p>
                <h3 className="text-sm font-medium text-zinc-900 leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-3 text-xs text-zinc-500 line-clamp-1">
                  {item.authors}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Preview */}
      <section className="border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {t('研究项目', 'Research Projects')}
            </h2>
            <Link
              href="/projects"
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
            >
              {t('查看全部', 'View All')} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentProjects.map((project) => (
              <article
                key={project.id}
                className="group p-8 border border-zinc-100 rounded-2xl hover:border-zinc-200 transition-all duration-300 card-hover bg-white"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="text-[11px] text-zinc-400 font-mono">
                      {cat}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-500 leading-relaxed line-clamp-2">
                  {project.description.short}
                </p>
                <p className="mt-4 text-xs text-zinc-400 line-clamp-1">
                  {project.authors}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities CTA */}
      <section className="border-t border-zinc-100 bg-zinc-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-medium mb-5 tracking-tight">
              {t('加入我们的研究团队', 'Join Our Research Team')}
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              {t(
                '课题组长期欢迎不同背景与研究兴趣的本、硕、博同学参与我们的研究。',
                'We welcome students with diverse backgrounds and research interests to join our research group.'
              )}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
              {siteData.opportunities.slice(0, 4).map((opp, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-zinc-300">
                  <span className="w-1 h-1 bg-zinc-500 rounded-full shrink-0" />
                  <span>{opp.title}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/opportunities"
              className="inline-flex items-center px-6 py-3 bg-white text-zinc-900 text-sm font-medium rounded-full hover:bg-zinc-100 transition-all duration-300 hover:shadow-lg"
            >
              {t('了解更多', 'Learn More')}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
