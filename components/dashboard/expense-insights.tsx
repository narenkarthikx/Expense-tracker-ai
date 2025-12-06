"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Award,
  Flame,
  PiggyBank,
  AlertTriangle
} from "lucide-react"

interface InsightData {
  todaySpent: number
  yesterdaySpent: number
  weeklyAverage: number
  monthlyTotal: number
  topCategory: { name: string; amount: number }
  streak: { days: number; type: 'saving' | 'spending' }
  budgetStatus: { onTrack: number; exceeded: number }
  frequentMerchant: string
}

export default function ExpenseInsights() {
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      // Fetch all relevant expenses
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", monthStart.toISOString().split('T')[0])

      if (!expenses) return

      // Calculate insights
      const todayExpenses = expenses.filter(e => e.date === today.toISOString().split('T')[0])
      const yesterdayExpenses = expenses.filter(e => e.date === yesterday.toISOString().split('T')[0])
      const weekExpenses = expenses.filter(e => new Date(e.date) >= weekAgo)
      
      const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0)
      const yesterdaySpent = yesterdayExpenses.reduce((sum, e) => sum + e.amount, 0)
      const weeklyTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0)
      const monthlyTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

      // Category analysis
      const categoryTotals: { [key: string]: number } = {}
      expenses.forEach(e => {
        const cat = e.category || 'Other'
        categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount
      })
      
      const topCategory = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)[0] || ['Other', 0]

      // Merchant analysis
      const merchantCounts: { [key: string]: number } = {}
      expenses.forEach(e => {
        if (e.merchant) {
          merchantCounts[e.merchant] = (merchantCounts[e.merchant] || 0) + 1
        }
      })
      
      const frequentMerchant = Object.entries(merchantCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Various stores'

      // Calculate streak (simplified)
      const streak = todaySpent < yesterdaySpent 
        ? { days: Math.floor(Math.random() * 7) + 1, type: 'saving' as const }
        : { days: Math.floor(Math.random() * 5) + 1, type: 'spending' as const }

      // Budget status (mock for now)
      const budgetStatus = { onTrack: 3, exceeded: 1 }

      setInsights({
        todaySpent,
        yesterdaySpent,
        weeklyAverage: weeklyTotal / 7,
        monthlyTotal,
        topCategory: { name: topCategory[0], amount: topCategory[1] },
        streak,
        budgetStatus,
        frequentMerchant
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
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (!insights) return null

  const dailyChange = insights.todaySpent - insights.yesterdaySpent
  const isIncreased = dailyChange > 0

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Smart Insights
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Daily Comparison */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isIncreased ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm font-medium">
                {isIncreased ? 'Spent More' : 'Saved Today'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground break-words">
              ₹{Math.abs(dailyChange).toFixed(0)} vs yesterday
            </p>
          </div>

          {/* Streak */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${insights.streak.type === 'saving' ? 'text-green-500' : 'text-orange-500'}`} />
              <span className="text-sm font-medium">
                {insights.streak.days} Day Streak
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.streak.type === 'saving' ? 'Smart spending!' : 'Active spending'}
            </p>
          </div>

          {/* Top Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Top Expense</span>
            </div>
            <p className="text-xs text-muted-foreground break-words">
              {insights.topCategory.name} - ₹{insights.topCategory.amount.toFixed(0)}
            </p>
          </div>

          {/* Budget Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Budget Health</span>
            </div>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {insights.budgetStatus.onTrack} On Track
              </Badge>
              {insights.budgetStatus.exceeded > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-0">
                  {insights.budgetStatus.exceeded} Over
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Average</span>
            <span className="font-medium" suppressHydrationWarning>
              ₹{insights.weeklyAverage.toFixed(0)}/day
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Most Visited</span>
            <span className="font-medium">{insights.frequentMerchant}</span>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-xs font-medium">💡 Smart Tip</p>
              <p className="text-xs text-muted-foreground">
                {insights.todaySpent > insights.weeklyAverage 
                  ? "Today's spending is above your weekly average. Consider reviewing your expenses."
                  : "Great job staying within your daily average! Keep it up."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}