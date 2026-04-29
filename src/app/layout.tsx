import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voice2Action – Civic Intelligence Platform',
  description: 'Real-time local issue reporting, voting, and governance intelligence for smarter cities.',
  keywords: ['smart city', 'civic tech', 'issue reporting', 'governance', 'local government'],
  openGraph: {
    title: 'Voice2Action',
    description: 'Your voice drives local change',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}