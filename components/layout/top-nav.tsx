"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Bell } from "lucide-react"
import Profile01 from "@/components/layout/content/UserDropdown"
import { ThemeToggle } from "../theme-toggle"
import { useSession, signOut } from "next-auth/react"

export default function TopNav() {
  const { data: session } = useSession()

  // Default avatar fallback
  const defaultAvatar = "/placeholder-user.jpg"
  const userAvatar = session?.user?.image || defaultAvatar
  const userName = session?.user?.name || "Guest User"
  const userEmail = session?.user?.email || "guest@example.com"

  const handleLogout = () => {
    signOut({ callbackUrl: '/signin' })
  }

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
        Optimized admin panel for game management
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Image
              src={userAvatar}
              alt={`${userName} avatar`}
              width={28}
              height={28}
              className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <Profile01 
              name={userName}
              role={userEmail}
              avatar={userAvatar}
              onLogout={handleLogout}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
