"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingCart,
  Refrigerator,
  Calendar,
  Lightbulb,
  BarChart3,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Shopping Lists", href: "/shopping-lists", icon: ShoppingCart },
  { name: "Fridge", href: "/fridge", icon: Refrigerator },
  { name: "Meal Planning", href: "/meal-planning", icon: Calendar },
  { name: "Suggestions", href: "/suggestions", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex items-center justify-between w-full">
      <nav className="flex items-center space-x-4 lg:space-x-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-black dark:text-white"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <>
            <span className="text-sm hidden md:inline mr-2">
              Hello, {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Login</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Register</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
