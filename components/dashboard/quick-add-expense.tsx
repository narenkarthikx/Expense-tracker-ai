"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Receipt } from "lucide-react"

export default function QuickAddExpense() {
  return (
    <Card className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Quick Actions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Add expenses using AI or manual entry</p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Link href="/expenses" className="flex-1 sm:flex-none">
            <Button className="h-9 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm">
              <Receipt className="w-4 h-4 mr-1.5" />
              <span className="text-sm">AI Scan</span>
            </Button>
          </Link>

          <Link href="/expenses" className="flex-1 sm:flex-none">
            <Button variant="outline" className="h-9 w-full sm:w-auto border-primary/30 hover:border-primary/50 hover:bg-primary/5">
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="text-sm">Manual Entry</span>
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
