"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Loader, Calendar, ChevronRight, FileText, CreditCard, MapPin, X, ShoppingCart, Utensils, Car, ShoppingBag, Heart, Popcorn, Zap, Plane, Fuel, MoreHorizontal } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface Expense {
  id: string
  amount: number
  description: string
  date: string
  category: string
  merchant?: string
  ai_confidence?: number
  receipt_url?: string
  extracted_data?: any
  payment_method?: string
}

interface ExpenseListProps {
  filters: {
    search: string
    category: string
    dateFilter: string
    dateRange: { start?: string, end?: string }
  }
}

const CATEGORY_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Groceries: ShoppingCart,
  Dining: Utensils,
  Transportation: Car,
  Shopping: ShoppingBag,
  Healthcare: Heart,
  Entertainment: Popcorn,
  Utilities: Zap,
  Travel: Plane,
  Gas: Fuel,
  Other: MoreHorizontal,
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

function groupExpensesByDate(expenses: Expense[]) {
  const groups: { [key: string]: Expense[] } = {}

  expenses.forEach(expense => {
    const dateKey = expense.date
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(expense)
  })

  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

export default function ExpenseList({ filters }: ExpenseListProps) {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
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

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchLower) ||
        (expense.merchant && expense.merchant.toLowerCase().includes(searchLower)) ||
        expense.category.toLowerCase().includes(searchLower)
      )
    }

    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(expense => expense.category === filters.category)
    }

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
      setSelectedExpense(null)
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

  const formatDateHeader = (dateString: string) => {
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
      return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
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

  const groupedExpenses = groupExpensesByDate(filteredExpenses)

  return (
    <>
      <div className="space-y-3">
        {/* Summary Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} • {groupedExpenses.length} {groupedExpenses.length === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              ₹{filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Date-wise Grouped Expenses */}
        {groupedExpenses.map(([date, expenses]) => {
          const dayTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0)
          return (
            <div key={date} className="space-y-1.5">
              {/* Date Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between py-1.5 px-3 bg-muted/80 backdrop-blur-sm rounded-md border border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <h3 className="font-semibold text-xs">{formatDateHeader(date)}</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {expenses.length}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-primary">₹{dayTotal.toFixed(0)}</p>
              </div>

              {/* Expenses for this date */}
              <div className="space-y-1.5 pl-1">
                {expenses.map((expense) => (
                  <Card
                    key={expense.id}
                    onClick={() => setSelectedExpense(expense)}
                    className="p-2.5 hover:shadow-md transition-all bg-card border-l-2 border-l-primary/20 hover:border-l-primary group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Icon & Details */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                          {(() => {
                            const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal
                            return <Icon className="w-4 h-4 text-primary" />
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate text-sm">{expense.description}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              {expense.category}
                            </Badge>
                            {expense.ai_confidence && expense.ai_confidence > 0.5 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <FileText className="w-2.5 h-2.5" />
                                  AI
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-base font-bold text-primary tabular-nums">₹{expense.amount.toFixed(0)}</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            {expense.ai_confidence && expense.ai_confidence > 0.7 && (
                              <Badge className="text-[9px] px-1 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                AI
                              </Badge>
                            )}
                            {expense.payment_method && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                <CreditCard className="w-2.5 h-2.5 mr-0.5" />
                                {expense.payment_method}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Expense Detail Drawer */}
      <Drawer open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <DrawerTitle className="text-base font-bold flex-1 truncate pr-2">
                  {selectedExpense?.description}
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            {selectedExpense && (
              <div className="px-6 pb-4 space-y-3">
                {/* Amount */}
                <div className="text-center py-3 bg-primary/5 rounded-lg">
                  <p className="text-3xl font-bold text-primary">₹{selectedExpense.amount.toFixed(0)}</p>
                </div>

                {/* Simple Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {new Date(selectedExpense.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{selectedExpense.category}</span>
                  </div>

                  {selectedExpense.extracted_data?.store_name && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Store</span>
                      <span className="font-medium">{selectedExpense.extracted_data.store_name}</span>
                    </div>
                  )}

                  {selectedExpense.extracted_data?.items && selectedExpense.extracted_data.items.length > 0 && (
                    <div className="py-2 border-b">
                      <span className="text-muted-foreground block mb-1.5 text-xs">Items Purchased</span>
                      <div className="space-y-1">
                        {selectedExpense.extracted_data.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs py-1">
                            <span className="flex-1 text-foreground">
                              <span className="text-muted-foreground mr-1">{item.quantity || 1}×</span>
                              {item.description}
                            </span>
                            <span className="font-medium text-primary ml-2">₹{((item.price || 0) * (item.quantity || 1)).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedExpense.ai_confidence && selectedExpense.ai_confidence > 0.5 && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Source</span>
                      <span className="font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        AI Scanned
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DrawerFooter className="pt-2 pb-6 px-6">
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </DrawerClose>
                <Button
                  variant="destructive"
                  onClick={() => selectedExpense && handleDelete(selectedExpense.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
