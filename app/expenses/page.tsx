"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import ExpenseList from "@/components/expenses/expense-list"
import ExpenseFilters from "@/components/expenses/expense-filters"
import SimpleExpenseForm from "@/components/simple-expense-form"
import { Receipt } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Card } from "@/components/ui/card"

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
      <div className="flex items-center gap-3 mb-2">
        <Receipt className="w-7 h-7 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Add new expenses and view your spending history</p>
        </div>
      </div>



      {/* Filters and List Section */}
      <div className="space-y-4">
        <ExpenseFilters onFiltersChange={handleFiltersChange} />
        <ExpenseList filters={filters} />
      </div>
    </div>
  )
}
