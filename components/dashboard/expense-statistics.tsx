"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"
import { 
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock
} from "lucide-react"

interface ExpenseStats {
  totalExpenses: number
  avgDaily: number
  avgWeekly: number
  mostExpensiveDay: { day: string; amount: number }
  expenseFrequency: { daily: number; weekly: number }
  topSpendingHour: number
  categoryCount: number
  aiScannedCount: number
  manualEntryCount: number
}

export default function ExpenseStatistics() {
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", monthStart.toISOString().split('T')[0])

      if (!expenses || expenses.length === 0) {
        setStats({
          totalExpenses: 0,
          avgDaily: 0,
          avgWeekly: 0,
          mostExpensiveDay: { day: 'N/A', amount: 0 },
          expenseFrequency: { daily: 0, weekly: 0 },
          topSpendingHour: 12,
          categoryCount: 0,
          aiScannedCount: 0,
          manualEntryCount: 0
        })
        return
      }

      // Calculate statistics
      const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
      const daysInMonth = now.getDate()
      const weeksInMonth = Math.ceil(daysInMonth / 7)
      
      // Group by day to find most expensive
      const dailyTotals: { [key: string]: number } = {}
      expenses.forEach(e => {
        const day = new Date(e.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        })
        dailyTotals[day] = (dailyTotals[day] || 0) + e.amount
      })
      
      const mostExpensiveDay = Object.entries(dailyTotals)
        .sort(([,a], [,b]) => b - a)[0] || ['No data', 0]

      // Category count
      const categories = new Set(expenses.map(e => e.category || 'Other'))
      
      // AI vs Manual count
      const aiScanned = expenses.filter(e => e.ai_confidence && e.ai_confidence > 0.5)
      const manualEntry = expenses.filter(e => !e.ai_confidence || e.ai_confidence <= 0.5)

      // Frequency analysis
      const expenseFrequency = {
        daily: expenses.length / daysInMonth,
        weekly: expenses.length / weeksInMonth
      }

      setStats({
        totalExpenses: expenses.length,
        avgDaily: totalAmount / daysInMonth,
        avgWeekly: totalAmount / weeksInMonth,
        mostExpensiveDay: { 
          day: mostExpensiveDay[0], 
          amount: mostExpensiveDay[1] 
        },
        expenseFrequency,
        topSpendingHour: 14, // Placeholder - could be calculated from created_at
        categoryCount: categories.size,
        aiScannedCount: aiScanned.length,
        manualEntryCount: manualEntry.length
      })
      
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-2 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      icon: <BarChart3 className="w-4 h-4" />,
      label: "Total Expenses",
      value: stats.totalExpenses.toString(),
      subtext: "this month",
      color: "text-blue-600"
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Daily Average",
      value: `₹${stats.avgDaily.toFixed(0)}`,
      subtext: "per day",
      color: "text-green-600"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Most Expensive Day",
      value: `₹${stats.mostExpensiveDay.amount.toFixed(0)}`,
      subtext: stats.mostExpensiveDay.day.length > 15 
        ? stats.mostExpensiveDay.day.substring(0, 12) + '...' 
        : stats.mostExpensiveDay.day,
      color: "text-orange-600"
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Categories Used",
      value: stats.categoryCount.toString(),
      subtext: "different types",
      color: "text-purple-600"
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: "Expense Frequency",
      value: `${stats.expenseFrequency.daily.toFixed(1)}`,
      subtext: "expenses/day",
      color: "text-indigo-600"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "AI vs Manual",
      value: `${stats.aiScannedCount}/${stats.manualEntryCount}`,
      subtext: "AI/Manual entries",
      color: "text-emerald-600"
    }
  ]

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950/50 dark:to-blue-950/20">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Expense Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statItems.map((item, index) => (
            <div 
              key={index}
              className="bg-background/60 rounded-lg p-4 space-y-2 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-muted/50 ${item.color}`}>
                  {item.icon}
                </div>
                <Badge variant="outline" className="text-xs">
                  Nov '25
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-lg font-bold" suppressHydrationWarning>
                  {item.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Insights */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">📊 Quick Insights</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <p>• Weekly spending: ₹{stats.avgWeekly.toFixed(0)}</p>
            <p>• {stats.aiScannedCount > 0 
              ? `${((stats.aiScannedCount / stats.totalExpenses) * 100).toFixed(0)}% AI scanned` 
              : 'Try AI scan for quick entry!'}</p>
            <p>• Active tracking: {stats.categoryCount} categories</p>
            <p>• Entry rate: {stats.expenseFrequency.daily.toFixed(1)} expenses/day</p>
          </div>
        </div>
      </div>
    </Card>
  )
}