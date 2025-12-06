"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"
import { TrendingUp, Calendar, Brain, Receipt } from "lucide-react"

interface ExpenseStats {
  today: number
  thisWeek: number
  thisMonth: number
  aiProcessed: number
  manualEntries: number
  totalExpenses: number
  topCategory: { name: string; amount: number } | null
}

export default function ExpenseOverviewEnhanced() {
  const [stats, setStats] = useState<ExpenseStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    aiProcessed: 0,
    manualEntries: 0,
    totalExpenses: 0,
    topCategory: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Get all expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date, processing_status, category')
        .eq('user_id', user.id)

      if (expenses) {
        const todayExpenses = expenses.filter(e => e.date === today)
        const weekExpenses = expenses.filter(e => e.date >= weekAgo)
        const monthExpenses = expenses.filter(e => e.date >= monthAgo)
        
        const aiProcessed = expenses.filter(e => e.processing_status === 'completed' && 
          (e as any).extracted_data || (e as any).ai_confidence).length
        
        const manual = expenses.length - aiProcessed

        // Calculate top category
        const categoryTotals: { [key: string]: number } = {}
        expenses.forEach(expense => {
          const category = expense.category || 'Other'
          categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
        })
        
        const topCategory = Object.entries(categoryTotals).reduce((max, [cat, amount]) => 
          amount > (max?.amount || 0) ? { name: cat, amount } : max, null as { name: string; amount: number } | null)

        setStats({
          today: todayExpenses.reduce((sum, e) => sum + e.amount, 0),
          thisWeek: weekExpenses.reduce((sum, e) => sum + e.amount, 0),
          thisMonth: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
          aiProcessed,
          manualEntries: manual,
          totalExpenses: expenses.length,
          topCategory
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
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
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Smart Expense Overview</h3>
        <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          AI Enhanced
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Time-based stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Today</div>
            <div className="text-lg sm:text-xl font-bold text-green-700 break-all">${stats.today.toFixed(2)}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200">
            <div className="text-xs sm:text-sm text-blue-600 font-medium mb-1">This Week</div>
            <div className="text-lg sm:text-xl font-bold text-blue-700 break-all">${stats.thisWeek.toFixed(2)}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
            <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">This Month</div>
            <div className="text-lg sm:text-xl font-bold text-purple-700 break-all">${stats.thisMonth.toFixed(2)}</div>
          </div>
        </div>

        {/* AI vs Manual tracking */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">AI Processing Stats</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-orange-700 text-xs sm:text-sm">📸 AI Receipts:</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                {stats.aiProcessed}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-700 text-xs sm:text-sm">✏️ Manual Entries:</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                {stats.manualEntries}
              </Badge>
            </div>
          </div>
          {stats.aiProcessed > 0 && (
            <div className="mt-2 text-xs text-orange-600">
              {Math.round((stats.aiProcessed / stats.totalExpenses) * 100)}% of expenses auto-categorized by AI
            </div>
          )}
        </div>

        {/* Top category */}
        {stats.topCategory && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-800">Top Spending Category</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-indigo-700 font-medium text-sm">{stats.topCategory.name}</span>
              <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                ${stats.topCategory.amount.toFixed(2)}
              </Badge>
            </div>
          </div>
        )}

        {/* Quick tip about AI features */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Receipt className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-teal-800 mb-1">💡 Smart Tip</div>
              <div className="text-teal-700 text-xs sm:text-sm leading-relaxed">
                Upload receipt photos for automatic categorization and data extraction. 
                AI recognizes merchants and categorizes expenses intelligently!
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}