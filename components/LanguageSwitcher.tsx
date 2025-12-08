'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLang('zh')}
        className={`px-2 py-1 rounded transition-colors ${
          lang === 'zh'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        中
      </button>
      <span className="text-gray-300">/</span>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded transition-colors ${
          lang === 'en'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        EN
      </button>
    </div>
  )
}

