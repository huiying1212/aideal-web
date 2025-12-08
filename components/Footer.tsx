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
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              <span className="font-mono">ai{'{'}</span>DEAL<span className="font-mono">{'}'}</span> Studio
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {lang === 'zh' ? siteData.name.subtitle.zh : siteData.name.subtitle.en}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {t('联系方式', 'Contact')}
            </h4>
            <div className="text-sm text-gray-500 space-y-1">
              <p>{lang === 'zh' ? siteData.contact.address.zh.institution : siteData.contact.address.en.institution}</p>
              <p>{lang === 'zh' ? siteData.contact.address.zh.city : siteData.contact.address.en.city}</p>
              <p>{lang === 'zh' ? siteData.contact.address.zh.street : siteData.contact.address.en.street}</p>
              <p className="mt-2">
                <a 
                  href={`mailto:${siteData.contact.email}`}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {siteData.contact.email}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {t('快速链接', 'Quick Links')}
            </h4>
            <ul className="text-sm text-gray-500 space-y-2">
              {siteData.navigation.map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className="hover:text-gray-900 transition-colors"
                  >
                    {lang === 'zh' ? item.name.zh : item.name.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Pengcheng An. {t('保留所有权利', 'All rights reserved')}.
          </p>
        </div>
      </div>
    </footer>
  )
}
