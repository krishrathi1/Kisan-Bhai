
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/hooks/use-auth';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BeejMantra — Your Kheti Partner, Har Kadam Saath',
  description: 'AI Assistant for Indian Farmers — crop doctor, live mandi rates, weather, and government schemes in your native language.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, playfair.variable, notoDevanagari.variable)} suppressHydrationWarning>
      <body className={cn('font-body antialiased bg-background text-foreground min-h-screen')} suppressHydrationWarning>
         <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
            disableTransitionOnChange
          >
            <AuthProvider>
              <LanguageProvider>
                {children}
                <Toaster />
              </LanguageProvider>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
