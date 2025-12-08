'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import siteData from '@/data/site.json'

export default function OpportunitiesPage() {
  const { lang, t } = useLanguage()

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      {/* Page Header */}
      <header className="mb-20 animate-fade-in">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
          {t('Opportunities', 'Opportunities')}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight">
          {t('加入我们', 'Join Our Team')}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16">
        {/* Main Content */}
        <div>
          {/* Opportunities */}
          <section className="mb-16">
            <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-8">
              {t('招生机会', 'Open Positions')}
            </h2>
            <div className="space-y-4">
              {siteData.opportunities.map((opp, index) => (
                <div
                  key={index}
                  className="group p-6 border border-zinc-100 rounded-2xl hover:border-zinc-200 hover:shadow-sm transition-all duration-300 bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-mono text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-base font-medium text-zinc-900">
                          {opp.title}
                        </h3>
                        {'description' in opp && opp.description && (
                          <p className="mt-1 text-sm text-zinc-500">
                            {opp.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {opp.link && (
                      <a
                        href={opp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-4 py-2 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-full hover:bg-zinc-200 transition-colors duration-300"
                      >
                        {t('了解更多', 'Learn More')} ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Message */}
          <section className="p-8 bg-zinc-50 rounded-3xl">
            <p className="text-zinc-600 leading-relaxed">
              {lang === 'zh'
                ? '课题组长期欢迎不同背景与研究兴趣的本、硕、博同学参与我们的研究，也欢迎你带着自己的想法建立自己的项目。校外甚至境外的小伙伴们，我们也提供访问学生与远程合作学生的机会。'
                : 'We welcome new members to join us! Our research group welcomes undergraduate, master\'s, and PhD students with diverse backgrounds and research interests. We also offer opportunities for visiting students and remote collaboration.'
              }
            </p>
          </section>
        </div>

        {/* Sidebar - Contact */}
        <div>
          <section className="sticky top-24">
            <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-6">
              {t('联系方式', 'Contact Us')}
            </h2>
            <div className="p-8 bg-zinc-900 text-white rounded-3xl">
              <p className="text-sm text-zinc-400 mb-5">
                {t('有任何问题？欢迎联系我们！', 'Have questions? Feel free to contact us!')}
              </p>
              <a
                href={`mailto:${siteData.contact.email}`}
                className="block text-lg font-mono text-white hover:text-zinc-300 transition-colors duration-300 break-all"
              >
                {siteData.contact.email}
              </a>

              <div className="mt-8 pt-6 border-t border-zinc-700/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                  {t('地址', 'Address')}
                </p>
                <p className="text-sm text-zinc-300">
                  {lang === 'zh' 
                    ? siteData.contact.address.zh.institution
                    : siteData.contact.address.en.institution
                  }
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  {lang === 'zh' 
                    ? siteData.contact.address.zh.city
                    : siteData.contact.address.en.city
                  }
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-700/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                  {t('小红书', 'Xiaohongshu')}
                </p>
                <a
                  href={siteData.contact.xiaohongshu.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-300 hover:text-white transition-colors duration-300"
                >
                  @{siteData.contact.xiaohongshu.name}
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
