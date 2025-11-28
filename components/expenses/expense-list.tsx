"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Loader, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

interface Expense {
  id: string
  amount: number
  description: string
  date: string
  category: string
  merchant?: string
  ai_confidence?: number
}

interface ExpenseListProps {
  filters: {
    search: string
    category: string
    dateFilter: string
    dateRange: { start?: string, end?: string }
  }
}

const CATEGORY_ICONS: { [key: string]: string } = {
  Groceries: "🛒",
  Dining: "🍽️",
  Transportation: "🚗",
  Shopping: "🛍️",
  Healthcare: "⚕️",
  Entertainment: "🎬",
  Utilities: "💡",
  Travel: "✈️",
  Gas: "⛽",
  Other: "📌",
}

function getDateRange(filter: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (filter) {
    case 'today':
      return {
        start: today.toISOString().split('T')[0],
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    case 'week':
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        start: weekAgo.toISOString().split('T')[0],
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        start: monthStart.toISOString().split('T')[0],
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    default:
      return null
  }
}

export default function ExpenseList({ filters }: ExpenseListProps) {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allExpenses])

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (!error && data) {
        setAllExpenses(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = useCallback(() => {
    let filtered = [...allExpenses]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchLower) ||
        (expense.merchant && expense.merchant.toLowerCase().includes(searchLower)) ||
        expense.category.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(expense => expense.category === filters.category)
    }

    // Date filter
    if (filters.dateFilter && filters.dateFilter !== 'all') {
      if (filters.dateFilter === 'custom' && (filters.dateRange.start || filters.dateRange.end)) {
        if (filters.dateRange.start) {
          filtered = filtered.filter(expense => expense.date >= filters.dateRange.start!)
        }
        if (filters.dateRange.end) {
          filtered = filtered.filter(expense => expense.date <= filters.dateRange.end!)
        }
      } else {
        const dateRange = getDateRange(filters.dateFilter)
        if (dateRange) {
          filtered = filtered.filter(expense => 
            expense.date >= dateRange.start && expense.date < dateRange.end
          )
        }
      }
    }

    setFilteredExpenses(filtered)
  }, [allExpenses, filters])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return

    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (!error) {
      setAllExpenses(prev => prev.filter((e) => e.id !== id))
    }
  }

  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      return new Date(dateString).toISOString().split('T')[0]
    }
    
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const expenseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (expenseDate.getTime() === today.getTime()) {
      return 'Today'
    } else if (expenseDate.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
      })
    }
  }

  if (loading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </Card>
    )
  }

  if (filteredExpenses.length === 0) {
    const hasFilters = filters.search || filters.category !== 'All' || filters.dateFilter !== 'all'
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-card to-card/50">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">
            {hasFilters ? 'No expenses match your filters' : 'No expenses yet'}
          </p>
          <p className="text-muted-foreground">
            {hasFilters ? 'Try adjusting your search criteria' : 'Start adding expenses to see them here'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredExpenses.length} of {allExpenses.length} expenses
        </p>
        <p className="text-sm font-medium">
          Total: ${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
        </p>
      </div>
      
      {filteredExpenses.map((expense) => (
        <Card
          key={expense.id}
          className="p-4 hover:shadow-md transition-all bg-gradient-to-r from-card to-card/50 border-primary/5 hover:border-primary/20 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="text-2xl">{CATEGORY_ICONS[expense.category] || "📌"}</div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-foreground truncate">{expense.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span suppressHydrationWarning>{formatDate(expense.date)}</span>
                  {expense.merchant && (
                    <>
                      <span>•</span>
                      <span>{expense.merchant}</span>
                    </>
                  )}
                  {expense.ai_confidence && expense.ai_confidence > 0.8 && (
                    <Badge variant="secondary" className="text-xs">
                      AI Scanned
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="text-right">
                <p className="text-xl font-bold text-primary tabular-nums">₹{expense.amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{expense.category}</p>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
