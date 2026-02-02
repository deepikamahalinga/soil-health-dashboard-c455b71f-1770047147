import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

export const metadata: Metadata = {
  title: 'Soil Health Dashboard',
  description: 'Location-based soil health data for Indian farmers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-white border-t">
              <div className="container mx-auto px-4 py-6 text-center text-gray-600">
                © {new Date().getFullYear()} Soil Health Dashboard
              </div>
            </footer>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  )
}