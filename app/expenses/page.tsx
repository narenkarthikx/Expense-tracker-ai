"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import ExpenseList from "@/components/expenses/expense-list"
import ExpenseFilters from "@/components/expenses/expense-filters"
import SimpleExpenseForm from "@/components/simple-expense-form"
import { Receipt } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function ExpensesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    dateFilter: 'all',
    dateRange: {} as { start?: string, end?: string }
  })

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Receipt className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Add & Manage Expenses</h1>
          <p className="text-muted-foreground">Smart AI receipt processing or manual entry - all in one place</p>
        </div>
      </div>

      {/* Simple Form */}
      <SimpleExpenseForm />

      {/* Filters and List */}
      <ExpenseFilters onFiltersChange={handleFiltersChange} />
      <ExpenseList filters={filters} />
    </div>
  )
}
