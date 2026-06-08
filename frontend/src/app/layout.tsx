import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReplyMind AI - Facebook Messenger Auto-Reply',
  description:
    'AI-powered Facebook Messenger auto-reply system. Connect your Facebook pages and let AI handle customer messages intelligently.',
  keywords: ['Facebook Messenger', 'AI', 'Auto-Reply', 'Chatbot', 'Customer Service'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}