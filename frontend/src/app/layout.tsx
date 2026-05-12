import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
   metadataBase: new URL('https://voice2action.vercel.app'),
  title: {
    default: 'Voice2Action — Local Issue Voting Platform',
    template: '%s | Voice2Action',
  },

  description:
    'Empowering citizens to report, vote, and track local civic issues. Make your community better with Voice2Action.',

  keywords: [
    'civic tech',
    'local issues',
    'community',
    'voting',
    'government',
    'citizen engagement',
    'public services',
  ],

  authors: [{ name: 'Voice2Action Team' }],

  creator: 'Voice2Action',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Voice2Action — Local Issue Voting Platform',
    description:
      'Report local civic issues, vote on what matters, and track resolution progress.',
    siteName: 'Voice2Action',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Voice2Action',
    description: 'Civic Tech Platform for Community Issues',
  },

  manifest: '/manifest.json',

  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#ffffff',
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#0f172a',
    },
  ],

  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}