'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import siteData from '@/data/site.json'

export default function Footer() {
  const { lang, t } = useLanguage()

  const socialLinks = [
    { name: 'Google Scholar', url: siteData.socialLinks.googleScholar },
    { name: 'ORCID', url: siteData.socialLinks.orcid },
    { name: 'ResearchGate', url: siteData.socialLinks.researchGate },
    { name: 'DBLP', url: siteData.socialLinks.dblp },
  ]

  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-medium text-zinc-900 mb-3">
              <span className="font-mono">ai{'{'}</span>DEAL<span className="font-mono">{'}'}</span>
              <span className="text-zinc-400 font-normal"> Studio</span>
            </h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              {lang === 'zh' ? siteData.name.subtitle.zh : siteData.name.subtitle.en}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
              {t('联系方式', 'Contact')}
            </h4>
            <div className="text-sm text-zinc-500 space-y-2">
              <p className="text-zinc-700 font-medium">
                {lang === 'zh' ? siteData.contact.address.zh.institution : siteData.contact.address.en.institution}
              </p>
              <p>{lang === 'zh' ? siteData.contact.address.zh.city : siteData.contact.address.en.city}</p>
              <p className="pt-2">
                <a 
                  href={`mailto:${siteData.contact.email}`}
                  className="text-zinc-700 hover:text-zinc-900 transition-colors duration-300"
                >
                  {siteData.contact.email}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
              {t('快速链接', 'Quick Links')}
            </h4>
            <ul className="text-sm text-zinc-500 space-y-2.5">
              {siteData.navigation.map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className="hover:text-zinc-900 transition-colors duration-300"
                  >
                    {lang === 'zh' ? item.name.zh : item.name.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Pengcheng An
          </p>
          <p className="text-xs text-zinc-400">
            {t('南方科技大学 · 创新创意设计学院', 'SUSTech · School of Design')}
          </p>
        </div>
      </div>
    </footer>
  )
}
