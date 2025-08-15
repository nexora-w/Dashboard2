import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardClient from "@/components/DashboardClient"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/signin")
  }

  return (
    <DashboardClient>
      <div className="min-h-screen p-8">
        <h1>Dashboard</h1>
      </div>
    </DashboardClient>
  )
}