import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { AppShell } from '@/components/layout/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'UniMate — The Academic Operating System for KFUEIT Students',
  description: 'Connect with verified campus peers, access solved past exam papers, recover lost items, and discover university scholarships in one prestige platform.',
  keywords: ['university', 'students', 'past papers', 'lost and found', 'scholarships', 'q&a', 'college community', 'kfueit'],
  authors: [{ name: 'UniMate Platform' }],
  manifest: '/manifest.json',
  verification: {
    google: 'google6ea23c10c93f9b0b',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('unimate_theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>
              <AppShell>
                {children}
              </AppShell>
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
