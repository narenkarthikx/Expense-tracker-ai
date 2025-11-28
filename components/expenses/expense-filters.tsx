"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Filter, Calendar, X } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

const CATEGORIES = [
  "All",
  "Groceries",
  "Dining",
  "Transportation",
  "Shopping",
  "Healthcare",
  "Entertainment",
  "Utilities",
  "Travel",
  "Gas",
  "Other",
]

const DATE_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' }
]

interface ExpenseFiltersProps {
  onFiltersChange: (filters: {
    search: string
    category: string
    dateFilter: string
    dateRange: { start?: string, end?: string }
  }) => void
}

export default function ExpenseFilters({ onFiltersChange }: ExpenseFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [dateFilter, setDateFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ start?: string, end?: string }>({})
  const [showDateInputs, setShowDateInputs] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Apply filters whenever any filter changes
    onFiltersChange({
      search: searchTerm,
      category: selectedCategory,
      dateFilter,
      dateRange
    })
  }, [searchTerm, selectedCategory, dateFilter, dateRange, onFiltersChange])

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)
    setShowDateInputs(value === 'custom')
    
    if (value !== 'custom') {
      setDateRange({})
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All")
    setDateFilter("all")
    setDateRange({})
    setShowDateInputs(false)
  }

  const hasActiveFilters = searchTerm || selectedCategory !== "All" || dateFilter !== "all" || Object.keys(dateRange).length > 0

  return (
    <Card className="p-5 bg-gradient-to-r from-card to-card/50 border-primary/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Filter Expenses</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Time Period</label>
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="w-full p-2 border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {DATE_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {showDateInputs && (
          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <Input
                type="date"
                value={dateRange.start || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <Input
                type="date"
                value={dateRange.end || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-input"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
