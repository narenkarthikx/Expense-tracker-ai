"use client"

import { useEffect, useState } from "react"
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
  icon: JSX.Element
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
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

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

      const smartSuggestions: SmartSuggestion[] = []\n\n      if (currentExpenses && lastMonthExpenses) {\n        // Analyze spending patterns\n        const currentTotal = currentExpenses.reduce((sum, e) => sum + e.amount, 0)\n        const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0)\n        const increase = currentTotal - lastMonthTotal\n\n        // Category analysis\n        const currentCategories: { [key: string]: number } = {}\n        const lastCategories: { [key: string]: number } = {}\n        \n        currentExpenses.forEach(e => {\n          const cat = e.category || 'Other'\n          currentCategories[cat] = (currentCategories[cat] || 0) + e.amount\n        })\n        \n        lastMonthExpenses.forEach(e => {\n          const cat = e.category || 'Other'\n          lastCategories[cat] = (lastCategories[cat] || 0) + e.amount\n        })\n\n        // Generate suggestions based on patterns\n        \n        // 1. High spending category warning\n        const topCategory = Object.entries(currentCategories)\n          .sort(([,a], [,b]) => b - a)[0]\n        \n        if (topCategory && topCategory[1] > 5000) {\n          smartSuggestions.push({\n            id: 'high-category',\n            type: 'category',\n            title: `High ${topCategory[0]} Spending`,\n            description: `₹${topCategory[1].toFixed(0)} spent on ${topCategory[0]} this month`,\n            action: 'Set Budget Limit',\n            icon: <ShoppingCart className=\"w-4 h-4\" />,\n            priority: 'high'\n          })\n        }\n\n        // 2. Dining out suggestion\n        const diningSpent = currentCategories['Dining'] || 0\n        if (diningSpent > 3000) {\n          smartSuggestions.push({\n            id: 'dining-tip',\n            type: 'category',\n            title: 'Dining Out Alert',\n            description: `₹${diningSpent.toFixed(0)} on dining. Consider cooking more at home!`,\n            action: 'View Recipes',\n            icon: <Utensils className=\"w-4 h-4\" />,\n            priority: 'medium'\n          })\n        }\n\n        // 3. Transportation costs\n        const transportSpent = (currentCategories['Transportation'] || 0) + (currentCategories['Gas'] || 0)\n        if (transportSpent > 2000) {\n          smartSuggestions.push({\n            id: 'transport-tip',\n            type: 'category',\n            title: 'Transport Costs Rising',\n            description: `₹${transportSpent.toFixed(0)} on transport. Try carpooling or public transport!`,\n            icon: <Car className=\"w-4 h-4\" />,\n            priority: 'medium'\n          })\n        }\n\n        // 4. Coffee/small expenses\n        const smallExpenses = currentExpenses.filter(e => e.amount < 500 && e.amount > 50)\n        if (smallExpenses.length > 20) {\n          const total = smallExpenses.reduce((sum, e) => sum + e.amount, 0)\n          smartSuggestions.push({\n            id: 'small-expenses',\n            type: 'amount',\n            title: 'Small Purchases Add Up',\n            description: `${smallExpenses.length} small purchases = ₹${total.toFixed(0)}`,\n            action: 'Track Daily Spending',\n            icon: <Coffee className=\"w-4 h-4\" />,\n            priority: 'low'\n          })\n        }\n\n        // 5. Spending increase warning\n        if (increase > 2000) {\n          smartSuggestions.push({\n            id: 'spending-increase',\n            type: 'amount',\n            title: 'Spending Increased',\n            description: `₹${increase.toFixed(0)} more than last month`,\n            action: 'Review Categories',\n            icon: <TrendingDown className=\"w-4 h-4\" />,\n            priority: 'high'\n          })\n        }\n      }\n\n      // Default suggestions if no specific patterns\n      if (smartSuggestions.length === 0) {\n        smartSuggestions.push(\n          {\n            id: 'budget-setup',\n            type: 'category',\n            title: 'Set Up Budgets',\n            description: 'Create spending limits for better financial control',\n            action: 'Create Budget',\n            icon: <Sparkles className=\"w-4 h-4\" />,\n            priority: 'medium'\n          },\n          {\n            id: 'receipt-scanning',\n            type: 'timing',\n            title: 'Try Receipt Scanning',\n            description: 'Upload receipts for automatic expense entry',\n            action: 'Upload Receipt',\n            icon: <Lightbulb className=\"w-4 h-4\" />,\n            priority: 'low'\n          }\n        )\n      }\n\n      setSuggestions(smartSuggestions.slice(0, 3)) // Show top 3\n      \n    } finally {\n      setLoading(false)\n    }\n  }\n\n  if (loading) {\n    return (\n      <Card className=\"p-6\">\n        <div className=\"animate-pulse space-y-4\">\n          <div className=\"h-4 bg-muted rounded w-1/3\"></div>\n          <div className=\"space-y-3\">\n            {[1, 2].map(i => (\n              <div key={i} className=\"space-y-2\">\n                <div className=\"h-3 bg-muted rounded w-full\"></div>\n                <div className=\"h-3 bg-muted rounded w-2/3\"></div>\n              </div>\n            ))}\n          </div>\n        </div>\n      </Card>\n    )\n  }\n\n  return (\n    <Card className=\"p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20\">\n      <div className=\"space-y-4\">\n        <h3 className=\"text-lg font-semibold flex items-center gap-2\">\n          <Lightbulb className=\"w-5 h-5 text-amber-500\" />\n          Smart Suggestions\n        </h3>\n\n        {suggestions.length === 0 ? (\n          <div className=\"text-center py-4\">\n            <p className=\"text-sm text-muted-foreground\">You're doing great! No specific suggestions right now.</p>\n          </div>\n        ) : (\n          <div className=\"space-y-3\">\n            {suggestions.map((suggestion) => (\n              <div\n                key={suggestion.id}\n                className=\"flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors\"\n              >\n                <div className={`p-1.5 rounded-lg ${\n                  suggestion.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' :\n                  suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' :\n                  'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'\n                }`}>\n                  {suggestion.icon}\n                </div>\n                \n                <div className=\"flex-1 min-w-0 space-y-1\">\n                  <div className=\"flex items-start justify-between gap-2\">\n                    <p className=\"font-medium text-sm\">{suggestion.title}</p>\n                    <Badge \n                      variant=\"outline\" \n                      className={`text-xs ${\n                        suggestion.priority === 'high' ? 'border-red-200 text-red-600' :\n                        suggestion.priority === 'medium' ? 'border-amber-200 text-amber-600' :\n                        'border-blue-200 text-blue-600'\n                      }`}\n                    >\n                      {suggestion.priority}\n                    </Badge>\n                  </div>\n                  <p className=\"text-xs text-muted-foreground\">{suggestion.description}</p>\n                  \n                  {suggestion.action && (\n                    <Button \n                      size=\"sm\" \n                      variant=\"ghost\" \n                      className=\"h-auto p-0 text-xs hover:bg-transparent hover:underline\"\n                    >\n                      {suggestion.action}\n                      <ChevronRight className=\"w-3 h-3 ml-1\" />\n                    </Button>\n                  )}\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n\n        <div className=\"pt-3 border-t border-border/50\">\n          <p className=\"text-xs text-muted-foreground text-center\">\n            💡 Suggestions update based on your spending patterns\n          </p>\n        </div>\n      </div>\n    </Card>\n  )\n}"}}]