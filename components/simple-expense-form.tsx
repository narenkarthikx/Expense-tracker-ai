"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase-client"
import { Plus, Upload, Loader2 } from "lucide-react"

const CATEGORIES = [
  "Groceries", "Dining", "Transportation", "Shopping", "Healthcare", 
  "Entertainment", "Utilities", "Travel", "Gas", "Other"
]

export default function SimpleExpenseForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const supabase = createClient()

  // Simple manual expense entry
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !user) return

    setLoading(true)
    try {
      const expenseData = {
        user_id: user.id,
        amount: parseFloat(amount),
        description: description || "Manual Entry",
        category: category || "Other", // Use selected category or default to Other
        date: new Date().toISOString().split("T")[0],
        processing_status: "completed"
      }

      console.log("Adding manual expense:", expenseData)

      const { data, error } = await supabase
        .from("expenses")
        .insert([expenseData])
        .select()

      if (error) {
        console.error("Database error:", error)
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        toast({
          title: "Database Error",
          description: `${error.message} (Code: ${error.code})`,
          variant: "destructive",
        })
      } else {
        console.log("Expense added successfully:", data)
        toast({
          title: "✅ Success!",
          description: `Added $${amount} expense successfully`,
        })
        setAmount("")
        setDescription("")
        setCategory("")
        // Refresh page after 1 second
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (err) {
      console.error("Add expense error:", err)
      toast({
        title: "Error",
        description: "Failed to add expense. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Simple receipt upload
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    console.log("Starting receipt upload:", file.name)
    setReceiptLoading(true)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string
          console.log("File converted to base64, calling API...")

          const response = await fetch("/api/process-receipt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64,
              userId: user.id,
            }),
          })

          const result = await response.json()
          console.log("API response:", result)

          if (result.success) {
            toast({
              title: "🎉 Receipt Processed!",
              description: result.message || "Expense extracted successfully",
            })
            setTimeout(() => window.location.reload(), 2000)
          } else {
            toast({
              title: "❌ Processing Failed",
              description: result.error || "Could not process receipt",
              variant: "destructive",
            })
          }
        } catch (fetchError) {
          console.error("API call failed:", fetchError)
          toast({
            title: "❌ Upload Failed",
            description: "Could not connect to AI service",
            variant: "destructive",
          })
        }
      }

      reader.onerror = () => {
        console.error("FileReader error")
        toast({
          title: "❌ File Error",
          description: "Could not read the file",
          variant: "destructive",
        })
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Receipt upload error:", error)
      toast({
        title: "❌ Upload Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setReceiptLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Please log in to add expenses</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Choose Your Method
        </h2>
        <p className="text-muted-foreground">Add expenses using AI receipt scanning or manual entry</p>
      </div>

      {/* AI Receipt Upload - Primary Method */}
      <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-500" />
          📸 AI Receipt Scanner
          <Badge className="ml-auto bg-blue-100 text-blue-700">Recommended</Badge>
        </h3>
        
        <div className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleReceiptUpload}
            disabled={receiptLoading}
            className="cursor-pointer"
          />
          
          {receiptLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing receipt with AI...</span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            📸 Upload a receipt image and AI will automatically extract expense details and categorize them intelligently based on merchant and items
          </p>
        </div>
      </Card>

      {/* Manual Entry - Secondary Method */}
      <Card className="p-6 border border-gray-200 bg-gradient-to-br from-gray-50/50 to-slate-50/50">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-6 h-6 text-green-500" />
          ✏️ Manual Entry
          <Badge variant="outline" className="ml-auto">Traditional</Badge>
        </h3>

        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="25.99"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              type="text"
              placeholder="Coffee, groceries, gas, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category (AI auto-categorizes receipts)" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !amount}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Debug Info */}
      <Card className="p-4 bg-muted/50">
        <h4 className="text-sm font-medium mb-2">🔧 Debug Info</h4>
        <div className="text-xs space-y-1">
          <p>User: {user?.id ? "✅ Logged in" : "❌ Not logged in"}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
        </div>
      </Card>
    </div>
  )
}