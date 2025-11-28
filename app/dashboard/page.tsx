"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import DashboardLayout from "@/components/layout/dashboard-layout"
import DateWiseTracking from "@/components/dashboard/expense-overview"
import RecentExpenses from "@/components/dashboard/recent-expenses"
import BudgetStatus from "@/components/dashboard/budget-status"
import QuickAddExpense from "@/components/dashboard/quick-add-expense"
import ExpenseInsights from "@/components/dashboard/expense-insights"
import SmartSuggestions from "@/components/dashboard/smart-suggestions"
import ExpenseStatistics from "@/components/dashboard/expense-statistics"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Loader } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to home
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link href="/needs">
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white">
              <ShoppingCart className="w-4 h-4" />
              Shopping List
            </Button>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuickAddExpense />
          </div>
          <div>
            <BudgetStatus />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <RecentExpenses />
        </div>

        {/* Insights and Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <DateWiseTracking />
          </div>
          <div>
            <ExpenseInsights />
          </div>
          <div>
            <SmartSuggestions />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6">
          <ExpenseStatistics />
        </div>
      </div>
    </DashboardLayout>
  )
}
