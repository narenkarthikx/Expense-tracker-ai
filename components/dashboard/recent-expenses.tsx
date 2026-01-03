"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader, ShoppingCart, Utensils, Car, ShoppingBag, Heart, Popcorn, Zap, Plane, Fuel, MoreHorizontal, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category: string
  merchant?: string
}

const CATEGORY_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Groceries: ShoppingCart,
  Dining: Utensils,
  "Food & Dining": Utensils,
  Transportation: Car,
  Transport: Car,
  Shopping: ShoppingBag,
  Healthcare: Heart,
  Health: Heart,
  Entertainment: Popcorn,
  Utilities: Zap,
  Travel: Plane,
  Gas: Fuel,
  Other: MoreHorizontal,
}

export default function RecentExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRecentExpenses()

    // Listen for new expenses to update list without reload
    const handleNewExpense = () => {
      fetchRecentExpenses()
    }
    window.addEventListener('expense-added', handleNewExpense)
    return () => window.removeEventListener('expense-added', handleNewExpense)
  }, [])

  const fetchRecentExpenses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5)

      if (data) {
        setExpenses(data)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center h-48 border-none shadow-none bg-transparent">
        <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
        <Link href="/expenses" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors px-2 py-1 hover:bg-primary/5 rounded-md">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          expenses.map((expense) => {
            const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal
            return (
              <div
                key={expense.id}
                className="group flex items-center gap-4 py-3 px-3 bg-card border border-border/40 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {expense.merchant || expense.description}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {expense.category} • {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <p className="font-medium text-sm text-foreground/90 tabular-nums">
                    ₹{expense.amount.toFixed(0)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
