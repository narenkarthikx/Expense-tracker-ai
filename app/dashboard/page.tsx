"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ExpenseOverviewEnhanced from "@/components/dashboard/expense-overview-enhanced"
import RecentExpenses from "@/components/dashboard/recent-expenses"
import QuickAddExpense from "@/components/dashboard/quick-add-expense"
import ExpenseInsights from "@/components/dashboard/expense-insights"
import SmartSuggestions from "@/components/dashboard/smart-suggestions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"

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
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6">
          <QuickAddExpense />
        </div>

        {/* Enhanced Overview and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ExpenseOverviewEnhanced />
          </div>
          <div>
            <ExpenseInsights />
          </div>
        </div>

        {/* Recent Expenses and Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <RecentExpenses />
          </div>
          <div>
            <SmartSuggestions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
