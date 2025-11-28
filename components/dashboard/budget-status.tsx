"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"
import { Loader, AlertCircle, PiggyBank, Plus, TrendingDown, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Budget {
  id: string
  category: string
  limit_amount: number
  spent: number
}

export default function BudgetStatus() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current month date range
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const { data: budgets } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("period", "monthly")

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, category")
        .eq("user_id", user.id)
        .gte("date", monthStart.toISOString().split('T')[0])
        .lte("date", monthEnd.toISOString().split('T')[0])

      if (budgets && expenses) {
        // Calculate spent amount for each budget category
        const categorySpending: { [key: string]: number } = {}
        expenses.forEach((exp: any) => {
          const category = exp.category || "Other"
          categorySpending[category] = (categorySpending[category] || 0) + exp.amount
        })

        const budgetsWithSpent = budgets.map((budget: any) => ({
          id: budget.id,
          category: budget.category || "Other",
          limit_amount: budget.limit_amount,
          spent: categorySpending[budget.category] || 0
        }))

        setBudgets(budgetsWithSpent)
        
        const total = budgets.reduce((sum: number, b: any) => sum + b.limit_amount, 0)
        const spent = Object.values(categorySpending).reduce((sum: number, amount: number) => sum + amount, 0)
        
        setTotalBudget(total)
        setTotalSpent(spent)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center h-80">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </Card>
    )
  }

  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const isOverBudget = overallPercentage > 100
  const remaining = totalBudget - totalSpent

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            Budget Status
          </h3>
          <Link href="/budget">
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-3 h-3" />
              Manage
            </Button>
          </Link>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-3">No budgets set for this month</p>
            <Link href="/budget">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Budget
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Overall Summary */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall This Month</span>
                {isOverBudget ? (
                  <div className="flex items-center gap-1 text-red-500">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Over Budget</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs">On Track</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>₹{totalSpent.toFixed(2)} spent</span>
                  <span>₹{totalBudget.toFixed(2)} budgeted</span>
                </div>
                <Progress 
                  value={Math.min(overallPercentage, 100)} 
                  className="h-3"
                />
                <p className="text-xs text-center text-muted-foreground">
                  {remaining > 0 
                    ? `₹${remaining.toFixed(2)} remaining` 
                    : `₹${Math.abs(remaining).toFixed(2)} over budget`
                  }
                </p>
              </div>
            </div>

            {/* Individual Budgets */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Category Breakdown</h4>
              {budgets.slice(0, 4).map((budget) => {
                const percentage = (budget.spent / budget.limit_amount) * 100
                const isExceeded = percentage > 100
                const isWarning = percentage > 75

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {budget.category}
                        {isExceeded && <AlertCircle className="w-3 h-3 text-red-500" />}
                        {isWarning && !isExceeded && <AlertCircle className="w-3 h-3 text-orange-500" />}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        ₹{budget.spent.toFixed(0)} / ₹{budget.limit_amount.toFixed(0)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage.toFixed(0)}%</span>
                        <span>
                          {budget.limit_amount - budget.spent > 0 
                            ? `₹${(budget.limit_amount - budget.spent).toFixed(0)} left`
                            : `₹${(budget.spent - budget.limit_amount).toFixed(0)} over`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {budgets.length > 4 && (
                <Link href="/budget">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all {budgets.length} budgets
                  </Button>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
