'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center p-0.5 bg-zinc-100 rounded-full">
      <button
        onClick={() => setLang('zh')}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
          lang === 'zh'
            ? 'bg-white text-zinc-900 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700'
        }`}
      >
        中
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
          lang === 'en'
            ? 'bg-white text-zinc-900 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-700'
        }`}
      >
        EN
      </button>
    </div>
  )
}
