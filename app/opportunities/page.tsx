'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import siteData from '@/data/site.json'

export default function OpportunitiesPage() {
  const { lang, t } = useLanguage()

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Page Header */}
      <header className="mb-16 animate-fade-in">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          {t('加入我们', 'Opportunities')}
        </h1>
        <p className="text-gray-500">{t('Opportunities', '加入我们')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16">
        {/* Main Content */}
        <div>
          {/* Opportunities */}
          <section className="mb-12">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
              {t('招生机会', 'Funded Opportunities')}
            </h2>
            <div className="space-y-4">
              {siteData.opportunities.map((opp, index) => (
                <div
                  key={index}
                  className="p-6 border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {opp.title}
                      </h3>
                      {'description' in opp && opp.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {opp.description}
                        </p>
                      )}
                    </div>
                    {opp.link && (
                      <a
                        href={opp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
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
          <section className="p-8 bg-gray-50 rounded-2xl">
            <p className="text-gray-600 leading-relaxed">
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
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
              {t('联系方式', 'Contact')}
            </h2>
            <div className="p-6 bg-gray-900 text-white rounded-2xl">
              <p className="text-sm text-gray-400 mb-4">
                {t('有任何问题？欢迎联系我们！', 'Have questions? Feel free to contact us!')}
              </p>
              <a
                href={`mailto:${siteData.contact.email}`}
                className="block text-lg font-mono text-white hover:text-gray-300 transition-colors break-all"
              >
                {siteData.contact.email}
              </a>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  {t('地址', 'Address')}
                </h3>
                <p className="text-sm text-gray-300">
                  {lang === 'zh' 
                    ? siteData.contact.address.zh.institution
                    : siteData.contact.address.en.institution
                  }
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {lang === 'zh' 
                    ? siteData.contact.address.zh.city
                    : siteData.contact.address.en.city
                  }
                </p>
                <p className="text-sm text-gray-400">
                  {lang === 'zh' 
                    ? siteData.contact.address.zh.street
                    : siteData.contact.address.en.street
                  }
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  {t('小红书', 'Xiaohongshu')}
                </h3>
                <a
                  href={siteData.contact.xiaohongshu.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {siteData.contact.xiaohongshu.name}
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
