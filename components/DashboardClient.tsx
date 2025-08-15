'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

interface DashboardClientProps {
  children: React.ReactNode
}

export default function DashboardClient({ children }: DashboardClientProps) {
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      toast({
        title: "Welcome back!",
        description: `Hello, ${session.user.name}! You're now signed in.`,
      })
    }
  }, [session, toast])

  return <>{children}</>
}
