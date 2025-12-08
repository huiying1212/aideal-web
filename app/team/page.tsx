'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import teamData from '@/data/team.json'

export default function TeamPage() {
  const { lang, t } = useLanguage()
  const { principalInvestigator, members, alumni } = teamData

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Page Header */}
      <header className="mb-16 animate-fade-in">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          {t('研究团队', 'Team')}
        </h1>
        <p className="text-gray-500">{t('Team', '研究团队')}</p>
      </header>

      {/* Principal Investigator */}
      <section className="mb-20">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
          {t('课题组负责人', 'Principal Investigator')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 p-8 bg-gray-50 rounded-2xl">
          <div>
            <div className="w-40 h-40 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900">
              {lang === 'zh' 
                ? `${principalInvestigator.name.zh} | ${principalInvestigator.name.en}`
                : `${principalInvestigator.name.en} | ${principalInvestigator.name.zh}`
              }
            </h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {principalInvestigator.links.orcid && (
                <a
                  href={principalInvestigator.links.orcid}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  ORCID ↗
                </a>
              )}
              {principalInvestigator.links.googleScholar && (
                <a
                  href={principalInvestigator.links.googleScholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Google Scholar ↗
                </a>
              )}
              {principalInvestigator.links.researchGate && (
                <a
                  href={principalInvestigator.links.researchGate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  ResearchGate ↗
                </a>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {lang === 'zh' ? principalInvestigator.bio.zh : principalInvestigator.bio.en}
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="mb-20">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
          {t('团队成员', 'Researchers')}
          <span className="ml-2 text-gray-300">
            ({t('按姓名字母排序', 'in alphabetical order')})
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <article
              key={index}
              className="p-6 border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50/50 transition-all group"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900">
                {lang === 'zh' 
                  ? (member.name.zh || member.name.en)
                  : (member.name.en || member.name.zh)
                }
                {member.name.zh && member.name.en && (
                  <span className="text-gray-400 font-normal">
                    {' '}| {lang === 'zh' ? member.name.en : member.name.zh}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {lang === 'zh' ? member.role.zh : member.role.en}
              </p>
              <p className="mt-3 text-sm text-gray-500 line-clamp-3">
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
                  className="inline-block mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {t('个人主页', 'Personal Website')} ↗
                </a>
              )}
            </article>
          ))}

          {/* Join Us Card */}
          <article className="p-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-700">
              {t('加入我们', 'Join Us')}
            </h3>
            <a
              href="/opportunities"
              className="mt-4 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {t('了解更多', 'Learn More')} →
            </a>
          </article>
        </div>
      </section>

      {/* Alumni */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
          {t('毕业小伙伴', 'Alumni')}
        </h2>
        <div className="flex flex-wrap gap-4">
          {alumni.map((alum, index) => (
            <div key={index} className="inline-flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {lang === 'zh' 
                  ? `${alum.name.zh} ${alum.name.en}`
                  : `${alum.name.en} ${alum.name.zh}`
                }
              </span>
              {alum.link && (
                <a
                  href={alum.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
