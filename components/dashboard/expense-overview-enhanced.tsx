"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"

interface ExpenseStats {
  today: number
  thisWeek: number
  thisMonth: number
  lastExpense: { merchant: string; amount: number } | null
  todayCount: number
  weekCount: number
}

export default function ExpenseOverviewEnhanced() {
  const [stats, setStats] = useState<ExpenseStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    lastExpense: null,
    todayCount: 0,
    weekCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()

    // Listen for new expenses to update stats without reload
    const handleNewExpense = () => {
      fetchStats()
    }
    window.addEventListener('expense-added', handleNewExpense)
    return () => window.removeEventListener('expense-added', handleNewExpense)
  }, [])

  const fetchStats = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const todayStr = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date, merchant, description')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (expenses) {
        const todayExp = expenses.filter(e => e.date === todayStr)
        const weekExp = expenses.filter(e => e.date >= weekAgo)
        const monthExp = expenses.filter(e => e.date >= monthAgo)

        setStats({
          today: todayExp.reduce((sum, e) => sum + e.amount, 0),
          thisWeek: weekExp.reduce((sum, e) => sum + e.amount, 0),
          thisMonth: monthExp.reduce((sum, e) => sum + e.amount, 0),
          lastExpense: expenses.length > 0 ? {
            merchant: expenses[0].merchant || expenses[0].description,
            amount: expenses[0].amount
          } : null,
          todayCount: todayExp.length,
          weekCount: weekExp.length
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
      <Card className="p-5 border-none shadow-none bg-transparent">
        <div className="flex gap-4 animate-pulse">
          <div className="h-20 w-1/3 bg-muted rounded-xl"></div>
          <div className="h-20 w-1/3 bg-muted rounded-xl"></div>
          <div className="h-20 w-1/3 bg-muted rounded-xl"></div>
        </div>
      </Card>
    )
  }

  // Logic for the single contextual status line
  const getContextStatus = () => {
    if (stats.todayCount === 0) return "No expenses added today"
    if (stats.lastExpense) return `Last expense: ${stats.lastExpense.merchant} ₹${stats.lastExpense.amount.toFixed(0)}`
    if (stats.weekCount > 0) return `You added ${stats.weekCount} expenses this week`
    return "Track your spending effortlessly"
  }

  return (
    <div className="space-y-4">
      {/* 3-Column Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Today - Emphasized */}
        <Card className="p-4 flex flex-col justify-center border-primary/20 bg-primary/5 shadow-none">
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1">Today</span>
          <span className="text-2xl font-bold text-primary tracking-tight">
            ₹{stats.today.toLocaleString('en-IN')}
          </span>
        </Card>

        {/* This Week */}
        <Card className="p-4 flex flex-col justify-center shadow-sm hover:bg-muted/30 transition-colors">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">This Week</span>
          <span className="text-xl font-semibold text-foreground tracking-tight">
            ₹{stats.thisWeek.toLocaleString('en-IN')}
          </span>
        </Card>

        {/* This Month */}
        <Card className="p-4 flex flex-col justify-center shadow-sm hover:bg-muted/30 transition-colors">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">This Month</span>
          <span className="text-xl font-semibold text-foreground tracking-tight">
            ₹{stats.thisMonth.toLocaleString('en-IN')}
          </span>
        </Card>
      </div>

      {/* Dynamic Contextual Status Line */}
      <div className="flex items-center justify-center text-xs text-muted-foreground font-medium py-1">
        {getContextStatus()}
      </div>
    </div>
  )
}