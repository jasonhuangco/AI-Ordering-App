import './globals.css'
import { Inter, Playfair_Display, Montserrat, Dancing_Script, Open_Sans } from 'next/font/google'
import AuthProvider from '../components/AuthProvider'
import { BrandingProvider } from '../components/BrandingProvider'
import BrandingErrorBoundary from '../components/BrandingErrorBoundary'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing-script' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' })

export const metadata = {
  title: 'Roaster Ordering v1 - Wholesale Coffee Platform',
  description: 'Professional wholesale coffee ordering system for cafes, restaurants, and retailers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${dancingScript.variable} ${openSans.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Apply cached branding immediately to prevent FOUC
              (function() {
                try {
                  const cachedBranding = localStorage.getItem('branding-settings');
                  if (cachedBranding) {
                    const branding = JSON.parse(cachedBranding);
                    const root = document.documentElement;
                    // Set CSS custom properties that match Tailwind config
                    root.style.setProperty('--color-primary', branding.primaryColor || '#8B4513');
                    root.style.setProperty('--color-secondary', branding.secondaryColor || '#D2B48C');
                    root.style.setProperty('--color-accent', branding.accentColor || '#DAA520');
                    root.style.setProperty('--color-background', branding.backgroundColor || '#F5F5DC');
                    root.style.setProperty('--color-button', branding.buttonColor || '#8B4513');
                    root.style.setProperty('--color-coffee-dark', branding.primaryColor || '#8B4513');
                    root.style.setProperty('--color-espresso', branding.primaryColor || '#8B4513');
                    // Also apply background to body if it exists
                    if (document.body) {
                      document.body.style.backgroundColor = branding.backgroundColor || '#F5F5DC';
                    } else {
                      // If body doesn't exist yet, wait for it
                      document.addEventListener('DOMContentLoaded', function() {
                        document.body.style.backgroundColor = branding.backgroundColor || '#F5F5DC';
                      });
                    }
                  }
                } catch (e) {
                  console.log('No cached branding found, using defaults');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-body min-h-screen antialiased">
        <AuthProvider>
          <BrandingErrorBoundary>
            <BrandingProvider>
              {children}
            </BrandingProvider>
          </BrandingErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}
