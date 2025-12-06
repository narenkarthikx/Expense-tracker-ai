"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Receipt } from "lucide-react"

export default function QuickAddExpense() {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" />
        Add Expense
      </h3>

      <div className="space-y-4">
        {/* Primary AI Receipt Upload Action */}
        <Link href="/expenses">
          <Button className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                <span className="text-lg">📱 Smart Receipt Upload</span>
              </div>
              <span className="text-sm opacity-90">AI auto-categorizes & extracts data</span>
            </div>
          </Button>
        </Link>

        {/* Manual Entry Option */}
        <Link href="/expenses">
          <Button variant="outline" className="w-full h-12 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Or Add Manually
          </Button>
        </Link>

        <p className="text-xs text-muted-foreground text-center">
          Both options available on the Expenses page
        </p>
      </div>
    </Card>
  )
}
