'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardClient from '@/components/DashboardClient'

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
      }
    }

    checkAuth()
  }, [router])

  if (!userId) {
    return null // or a loading spinner
  }

  return <DashboardClient userId={userId} />
}

// Add runtime configuration for better performance
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
