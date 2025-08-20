'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard') // Redirect non-admin users to customer dashboard
    }
  }, [status, session, router])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-coffee-brown text-xl">Redirecting...</div>
    </div>
  )
}
