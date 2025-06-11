"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, ShoppingCart, Refrigerator, Calendar, Lightbulb, BarChart3 } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Shopping Lists", href: "/shopping-lists", icon: ShoppingCart },
  { name: "Fridge", href: "/fridge", icon: Refrigerator },
  { name: "Meal Planning", href: "/meal-planning", icon: Calendar },
  { name: "Suggestions", href: "/suggestions", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-black dark:text-white" : "text-muted-foreground",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
