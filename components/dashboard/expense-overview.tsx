"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"
import { Loader, Calendar, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"

type TimeFilter = 'today' | 'yesterday' | 'week' | 'month'

interface ExpenseStats {
  total: number
  count: number
  change: number
  changePercent: number
}

export default function DateWiseTracking() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('today')
  const [stats, setStats] = useState<ExpenseStats>({ total: 0, count: 0, change: 0, changePercent: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchExpenseStats()
  }, [activeFilter])

  const getDateRange = (filter: TimeFilter) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          compareStart: new Date(today.getTime() - 24 * 60 * 60 * 1000),
          compareEnd: today
        }
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        return {
          start: yesterday,
          end: today,
          compareStart: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000),
          compareEnd: yesterday
        }
      case 'week':
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return {
          start: weekStart,
          end: today,
          compareStart: new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000),
          compareEnd: weekStart
        }
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          start: monthStart,
          end: now,
          compareStart: prevMonthStart,
          compareEnd: prevMonthEnd
        }
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000), compareStart: today, compareEnd: today }
    }
  }

  const fetchExpenseStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { start, end, compareStart, compareEnd } = getDateRange(activeFilter)

      // Get current period expenses
      const { data: currentExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id)
        .gte("date", start.toISOString().split('T')[0])
        .lt("date", end.toISOString().split('T')[0])

      // Get comparison period expenses
      const { data: compareExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id)
        .gte("date", compareStart.toISOString().split('T')[0])
        .lt("date", compareEnd.toISOString().split('T')[0])

      const currentTotal = currentExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
      const compareTotal = compareExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
      const change = currentTotal - compareTotal
      const changePercent = compareTotal > 0 ? (change / compareTotal) * 100 : 0

      setStats({
        total: currentTotal,
        count: currentExpenses?.length || 0,
        change,
        changePercent
      })
    } finally {
      setLoading(false)
    }
  }

  const filterLabels = {
    today: 'Today',
    yesterday: 'Yesterday', 
    week: 'This Week',
    month: 'This Month'
  }

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center h-48">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Expense Tracking
        </h3>
      </div>

      {/* Time Filter Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {(Object.keys(filterLabels) as TimeFilter[]).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={activeFilter === filter ? "bg-primary text-white" : ""}
          >
            {filterLabels[filter]}
          </Button>
        ))}
      </div>

      {/* Stats Display */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">${stats.total.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            {stats.count} expense{stats.count !== 1 ? 's' : ''} {filterLabels[activeFilter].toLowerCase()}
          </p>
        </div>

        {/* Comparison */}
        {stats.change !== 0 && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/30">
            {stats.change > 0 ? (
              <ArrowUp className="w-4 h-4 text-red-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-sm font-medium ${
              stats.change > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              ${Math.abs(stats.change).toFixed(2)} ({Math.abs(stats.changePercent).toFixed(1)}%)
            </span>
            <span className="text-sm text-muted-foreground">
              vs {activeFilter === 'today' ? 'yesterday' : 
                   activeFilter === 'yesterday' ? 'day before' :
                   activeFilter === 'week' ? 'last week' : 'last month'}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
