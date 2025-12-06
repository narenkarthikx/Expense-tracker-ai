"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"
import { 
  Lightbulb, 
  TrendingDown, 
  Coffee,
  Car,
  ShoppingCart,
  Utensils,
  Sparkles,
  ChevronRight
} from "lucide-react"

interface SmartSuggestion {
  id: string
  type: 'category' | 'merchant' | 'amount' | 'timing'
  title: string
  description: string
  action?: string
  icon: React.ReactElement
  priority: 'high' | 'medium' | 'low'
}

export default function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    generateSuggestions()
  }, [])

  const generateSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      // Get current and last month expenses
      const { data: currentExpenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", monthStart.toISOString().split('T')[0])

      const { data: lastMonthExpenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", lastMonth.toISOString().split('T')[0])
        .lt("date", monthStart.toISOString().split('T')[0])

      const smartSuggestions: SmartSuggestion[] = []

      if (currentExpenses && lastMonthExpenses) {
        // Analyze spending patterns
        const currentTotal = currentExpenses.reduce((sum, e) => sum + e.amount, 0)
        const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
        const increase = currentTotal - lastMonthTotal

        // Category analysis
        const currentCategories: { [key: string]: number } = {}
        
        currentExpenses.forEach(e => {
          const cat = e.category || 'Other'
          currentCategories[cat] = (currentCategories[cat] || 0) + e.amount
        })

        // Generate suggestions based on patterns
        
        // 1. High spending category warning
        const topCategory = Object.entries(currentCategories)
          .sort(([,a], [,b]) => b - a)[0]
        
        if (topCategory && topCategory[1] > 5000) {
          smartSuggestions.push({
            id: 'high-category',
            type: 'category',
            title: `High ${topCategory[0]} Spending`,
            description: `₹${topCategory[1].toFixed(0)} spent on ${topCategory[0]} this month`,
            action: 'Set Budget Limit',
            icon: <ShoppingCart className="w-4 h-4" />,
            priority: 'high'
          })
        }

        // 2. Dining out suggestion
        const diningSpent = currentCategories['Dining'] || 0
        if (diningSpent > 3000) {
          smartSuggestions.push({
            id: 'dining-tip',
            type: 'category',
            title: 'Dining Out Alert',
            description: `₹${diningSpent.toFixed(0)} on dining. Consider cooking more at home!`,
            action: 'View Recipes',
            icon: <Utensils className="w-4 h-4" />,
            priority: 'medium'
          })
        }

        // 3. Transportation costs
        const transportSpent = (currentCategories['Transportation'] || 0) + (currentCategories['Gas'] || 0)
        if (transportSpent > 2000) {
          smartSuggestions.push({
            id: 'transport-tip',
            type: 'category',
            title: 'Transport Costs Rising',
            description: `₹${transportSpent.toFixed(0)} on transport. Try carpooling or public transport!`,
            icon: <Car className="w-4 h-4" />,
            priority: 'medium'
          })
        }

        // 4. Coffee/small expenses
        const smallExpenses = currentExpenses.filter(e => e.amount < 500 && e.amount > 50)
        if (smallExpenses.length > 20) {
          const total = smallExpenses.reduce((sum, e) => sum + e.amount, 0)
          smartSuggestions.push({
            id: 'small-expenses',
            type: 'amount',
            title: 'Small Purchases Add Up',
            description: `${smallExpenses.length} small purchases = ₹${total.toFixed(0)}`,
            action: 'Track Daily Spending',
            icon: <Coffee className="w-4 h-4" />,
            priority: 'low'
          })
        }

        // 5. Spending increase warning
        if (increase > 2000) {
          smartSuggestions.push({
            id: 'spending-increase',
            type: 'amount',
            title: 'Spending Increased',
            description: `₹${increase.toFixed(0)} more than last month`,
            action: 'Review Categories',
            icon: <TrendingDown className="w-4 h-4" />,
            priority: 'high'
          })
        }
      }

      // Default suggestions if no specific patterns
      if (smartSuggestions.length === 0) {
        smartSuggestions.push(
          {
            id: 'budget-setup',
            type: 'category',
            title: 'Set Up Budgets',
            description: 'Create spending limits for better financial control',
            action: 'Create Budget',
            icon: <Sparkles className="w-4 h-4" />,
            priority: 'medium'
          },
          {
            id: 'receipt-scanning',
            type: 'timing',
            title: 'Try Receipt Scanning',
            description: 'Upload receipts for automatic expense entry',
            action: 'Upload Receipt',
            icon: <Lightbulb className="w-4 h-4" />,
            priority: 'low'
          }
        )
      }

      setSuggestions(smartSuggestions.slice(0, 3)) // Show top 3
      
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Smart Suggestions
        </h3>

        {suggestions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">You're doing great! No specific suggestions right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className={`p-1.5 rounded-lg ${
                  suggestion.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                  suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                }`}>
                  {suggestion.icon}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-medium text-sm">{suggestion.title}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs flex-shrink-0 ${
                        suggestion.priority === 'high' ? 'border-red-200 text-red-600' :
                        suggestion.priority === 'medium' ? 'border-amber-200 text-amber-600' :
                        'border-blue-200 text-blue-600'
                      }`}
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.description}</p>
                  
                  {suggestion.action && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-auto p-0 text-xs hover:bg-transparent hover:underline"
                    >
                      {suggestion.action}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            💡 Suggestions update based on your spending patterns
          </p>
        </div>
      </div>
    </Card>
  )
}