'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import teamData from '@/data/team.json'

export default function TeamPage() {
  const { lang, t } = useLanguage()
  const { principalInvestigator, members, alumni } = teamData

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      {/* Page Header */}
      <header className="mb-20 animate-fade-in">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
          {t('Team', 'Team')}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight">
          {t('研究团队', 'Our Team')}
        </h1>
      </header>

      {/* Principal Investigator */}
      <section className="mb-24">
        <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-8">
          {t('课题组负责人', 'Principal Investigator')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10 p-8 md:p-10 bg-zinc-50 rounded-3xl">
          <div>
            <div className="w-40 h-40 bg-gradient-to-br from-zinc-200 to-zinc-300 rounded-2xl flex items-center justify-center">
              <svg className="w-16 h-16 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-medium text-zinc-900">
              {lang === 'zh' 
                ? principalInvestigator.name.zh
                : principalInvestigator.name.en
              }
            </h3>
            <p className="text-zinc-500 mt-1">
              {lang === 'zh' 
                ? principalInvestigator.name.en
                : principalInvestigator.name.zh
              }
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {principalInvestigator.links.googleScholar && (
                <a
                  href={principalInvestigator.links.googleScholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
                >
                  Google Scholar ↗
                </a>
              )}
              {principalInvestigator.links.orcid && (
                <a
                  href={principalInvestigator.links.orcid}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
                >
                  ORCID ↗
                </a>
              )}
              {principalInvestigator.links.researchGate && (
                <a
                  href={principalInvestigator.links.researchGate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
                >
                  ResearchGate ↗
                </a>
              )}
            </div>
            <p className="mt-6 text-sm text-zinc-600 leading-relaxed">
              {lang === 'zh' ? principalInvestigator.bio.zh : principalInvestigator.bio.en}
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="mb-24">
        <div className="flex items-baseline gap-3 mb-8">
          <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {t('团队成员', 'Researchers')}
          </h2>
          <span className="text-[11px] text-zinc-300">
            {t('按姓名字母排序', 'alphabetical')}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member, index) => (
            <article
              key={index}
              className="group p-6 border border-zinc-100 rounded-2xl hover:border-zinc-200 hover:shadow-sm transition-all duration-300 bg-white"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-zinc-400">
                    {(member.name.zh || member.name.en).charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-zinc-900 truncate">
                    {lang === 'zh' 
                      ? (member.name.zh || member.name.en)
                      : (member.name.en || member.name.zh)
                    }
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {lang === 'zh' ? member.role.zh : member.role.en}
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3">
                {lang === 'zh' 
                  ? (member.bio.zh || member.bio.en)
                  : (member.bio.en || member.bio.zh)
                }
              </p>
              {'website' in member && member.website && (
                <a
                  href={member.website as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-xs text-zinc-400 hover:text-zinc-600 transition-colors duration-300"
                >
                  {t('个人主页', 'Website')} ↗
                </a>
              )}
            </article>
          ))}

          {/* Join Us Card */}
          <article className="p-6 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-center hover:border-zinc-300 hover:bg-zinc-50/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-zinc-700 mb-1">
              {t('加入我们', 'Join Us')}
            </h3>
            <a
              href="/opportunities"
              className="mt-3 text-xs text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
            >
              {t('了解更多', 'Learn More')} →
            </a>
          </article>
        </div>
      </section>

      {/* Alumni */}
      <section>
        <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-6">
          {t('毕业小伙伴', 'Alumni')}
        </h2>
        <div className="flex flex-wrap gap-3">
          {alumni.map((alum, index) => (
            <div 
              key={index} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors duration-300"
            >
              <span className="text-sm text-zinc-600">
                {lang === 'zh' ? alum.name.zh : alum.name.en}
              </span>
              {alum.link && (
                <a
                  href={alum.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-600 transition-colors duration-300"
                >
                  ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
