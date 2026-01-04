"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase-client"
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react"
import { format } from "date-fns"

interface MonthlyOverviewProps {
  dateRange: {
    from: Date
    to: Date
  }
}

export default function MonthlyOverview({ dateRange }: MonthlyOverviewProps) {
  const [loading, setLoading] = useState(true)
  const [totalSpent, setTotalSpent] = useState(0)
  const [lastPeriodSpent, setLastPeriodSpent] = useState(0)
  const [budgetLimit, setBudgetLimit] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { from, to } = dateRange

      const startOfPeriod = format(from, 'yyyy-MM-dd')
      const endOfPeriod = format(to, 'yyyy-MM-dd')

      // Previous Period Calculation
      const duration = to.getTime() - from.getTime()
      const prevToDate = new Date(from.getTime() - 86400000) // 1 day before start
      const prevFromDate = new Date(prevToDate.getTime() - duration)

      const startOfLastPeriod = format(prevFromDate, 'yyyy-MM-dd')
      const endOfLastPeriod = format(prevToDate, 'yyyy-MM-dd')

      // Fetch Expenses for Selected Period
      const { data: currentData } = await supabase.from("expenses").select("amount")
        .eq("user_id", user.id).gte("date", startOfPeriod).lte("date", endOfPeriod)

      // Fetch Expenses for Previous Period
      const { data: lastData } = await supabase.from("expenses").select("amount")
        .eq("user_id", user.id).gte("date", startOfLastPeriod).lte("date", endOfLastPeriod)

      // Fetch Active Budgets (Standing Budget)
      const { data: budgets } = await supabase.from("budgets").select("limit").eq("user_id", user.id)

      if (currentData) setTotalSpent(currentData.reduce((sum, item) => sum + item.amount, 0))
      if (lastData) setLastPeriodSpent(lastData.reduce((sum, item) => sum + item.amount, 0))
      if (budgets) setBudgetLimit(budgets.reduce((sum, b) => sum + b.limit, 0))

    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>

  const diff = totalSpent - lastPeriodSpent
  const percentageChange = lastPeriodSpent > 0 ? (diff / lastPeriodSpent) * 100 : 0
  const isHigher = diff > 0

  // Calculate Pro-rated Budget
  const msPerDay = 1000 * 60 * 60 * 24
  const daysInPeriod = Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / msPerDay))

  // Logic: Scale the annual/monthly budget to the selected period
  // We assume the 'budgets' table stores MONTHLY limits.
  const proRatedBudget = (budgetLimit / 30) * daysInPeriod

  // Decide what label to show
  const isMonthly = daysInPeriod >= 28 && daysInPeriod <= 31
  const budgetLabel = isMonthly ? "Monthly Budget" : `Est. Budget (${daysInPeriod} days)`

  const budgetRemaining = proRatedBudget - totalSpent
  const isBudgetSet = budgetLimit > 0

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Spent */}
        <Card className="p-6 relative overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Spent</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">₹{totalSpent.toLocaleString()}</span>
          </div>

          <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${isHigher ? "text-destructive" : "text-green-600"}`}>
            {Math.abs(diff) > 0 ? (
              <>
                {isHigher ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(percentageChange).toFixed(0)}% {isHigher ? "higher" : "lower"} than last period
              </>
            ) : (
              <span className="text-muted-foreground">Same as last period</span>
            )}
          </div>
        </Card>

        {/* Card 2: Daily Average */}
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Daily Average</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              ₹{(totalSpent / daysInPeriod).toFixed(0)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Average spent per day in this period
          </p>
        </Card>

        {/* Card 3: Budget Status */}
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Budget Status</p>

          {isBudgetSet ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${budgetRemaining < 0 ? "text-destructive" : "text-primary"}`}>
                  {budgetRemaining < 0 ? "-" : ""}₹{Math.abs(budgetRemaining).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-sm text-muted-foreground">left</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                of ₹{proRatedBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({budgetLabel})
              </p>
            </>
          ) : (
            <div className="flex flex-col h-full justify-center">
              <span className="text-xl font-bold text-muted-foreground">No Budget Set</span>
              <p className="text-xs text-muted-foreground mt-1">
                Budgets utilize your current settings.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
