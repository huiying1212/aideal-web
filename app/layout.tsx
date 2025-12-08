import type { Metadata } from 'next'
import { Noto_Sans_SC, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { LanguageProvider } from '@/contexts/LanguageContext'

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ai{DEAL} Studio | 人机交互课题组',
  description: 'We design, prototype, and study intelligent, interactive systems for real-world settings to assist and augment learning, education, children and their families, and underprivileged groups.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${notoSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <LanguageProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
