'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import siteData from '@/data/site.json'
import projectsData from '@/data/projects.json'

export default function Home() {
  const { lang, t } = useLanguage()
  const recentProjects = projectsData.projects.slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-medium text-gray-900 leading-tight tracking-tight">
            {t('我们是', 'We are')}{' '}
            <span className="font-mono">ai{'{'}</span>DEAL<span className="font-mono">{'}'}</span>
            <span className="text-gray-400"> Studio</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            {lang === 'zh' ? siteData.description.zh : siteData.description.en}
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              {t('查看项目', 'View Projects')}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/opportunities"
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors"
            >
              {t('加入我们', 'Join Us')}
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            {t('最新动态', 'News')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {siteData.news.slice(0, 3).map((item, index) => (
              <article
                key={index}
                className={`p-6 bg-gray-50 rounded-xl animate-fade-in-delay-${index + 1}`}
              >
                <span className="inline-block px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded mb-3">
                  {t('论文录用', 'Paper Accepted')}
                </span>
                <p className="text-xs text-gray-500 mb-2">{item.venue}</p>
                <h3 className="text-sm font-medium text-gray-900 leading-snug">
                  {item.paperTitle}
                </h3>
                <p className="mt-2 text-xs text-gray-500">
                  {item.authors}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Preview */}
      <section className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              {t('研究项目', 'Projects')}
            </h2>
            <Link
              href="/projects"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {t('查看全部', 'View All')} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentProjects.map((project) => (
              <article
                key={project.id}
                className="group p-6 border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50/50 transition-all"
              >
                <div className="flex gap-3 mb-3">
                  {project.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="text-xs text-gray-400">
                      #{cat}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {project.description.short}
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  {project.authors}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities CTA */}
      <section className="border-t border-gray-100 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-medium mb-4">{t('加入我们', 'Join Us')}</h2>
            <p className="text-gray-400 mb-6">
              {t(
                '课题组长期欢迎不同背景与研究兴趣的本、硕、博同学参与我们的研究。',
                'We welcome new members with diverse backgrounds and research interests to join us!'
              )}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {siteData.opportunities.slice(0, 4).map((opp, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-gray-500 mt-0.5">→</span>
                  <span>{opp.title}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/opportunities"
              className="inline-flex items-center px-5 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
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
