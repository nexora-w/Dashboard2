"use client"

import {
  BarChart2,
  Receipt,
  Building2,
  CreditCard,
  Folder,
  Wallet,
  Users2,
  Shield,
  MessagesSquare,
  Video,
  Settings,
  HelpCircle,
  Menu,
  Trophy,
  Gamepad2,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

import { Home } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCs2dleCollapsed, setIsCs2dleCollapsed] = useState(false)

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  function toggleCs2dle() {
    setIsCs2dleCollapsed(!isCs2dleCollapsed)
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: any
    children: React.ReactNode
  }) {
    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo/logo.svg"
                alt="Acme"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <span className="text-lg font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
                Guess Game
              </span>
            </div>
          </Link>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Overview
                </div>
                <div className="space-y-1">
                  <NavItem href="#" icon={Home}>
                    Dashboard
                  </NavItem>
                  <NavItem href="#" icon={BarChart2}>
                    Analytics
                  </NavItem>
                </div>
              </div>

              <div>
                <div 
                  className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  onClick={toggleCs2dle}
                >
                  <div className="flex items-center gap-2 hover:cursor-pointer">
                    <Image
                      src="/images/logo/cs2dle/logo.svg"
                      alt="CS2dle"
                      width={16}
                      height={16}
                    />
                    CS2dle
                    <ChevronDown className={`h-5 w-5 ml-auto transition-transform duration-300 ease-in-out ${
                      isCs2dleCollapsed ? 'rotate-[-90deg]' : 'rotate-0'
                    }`} />
                  </div>
                </div>
                <div 
                  className={`space-y-1 pl-2 overflow-hidden transition-all duration-300 ease-in-out ${
                    isCs2dleCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                  }`}
                >
                  <NavItem href="/dashboard/cs2dle" icon={BarChart2}>
                    Overview
                  </NavItem>
                  <NavItem href="/dashboard/cs2dle/games" icon={Gamepad2}>
                    Games
                  </NavItem>
                  <NavItem href="/dashboard/cs2dle/analytics" icon={TrendingUp}>
                    Analytics
                  </NavItem>
                  <NavItem href="/dashboard/cs2dle/leaderboard" icon={Trophy}>
                    Leaderboard
                  </NavItem>
                  <NavItem href="/dashboard/cs2dle/users" icon={Users2}>
                    Users
                  </NavItem>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <div className="space-y-1">
              <NavItem href="#" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="#" icon={HelpCircle}>
                Help
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
