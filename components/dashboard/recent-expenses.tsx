"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader, Trash2, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category: string
}

const CATEGORY_ICONS: { [key: string]: string } = {
  Groceries: "🛒",
  "Food & Dining": "🍽️",
  Utilities: "💡",
  Housing: "🏠",
  Transport: "🚗",
  Entertainment: "🎬",
  Health: "⚕️",
  Other: "📌",
}

export default function RecentExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRecentExpenses()
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
        .limit(8)

      if (data) {
        setExpenses(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id)
    if (!error) {
      setExpenses(expenses.filter((e) => e.id !== id))
    }
  }

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center h-80">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Recent Expenses
        </h3>
        <Link href="/expenses">
          <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No expenses recorded yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start by adding your first expense</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-2xl">{CATEGORY_ICONS[expense.category] || "📌"}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {typeof window !== 'undefined' 
                      ? new Date(expense.date).toLocaleDateString() 
                      : expense.date
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <p className="font-bold text-primary tabular-nums">-${expense.amount.toFixed(2)}</p>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
