"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ScanLine, Loader2, Upload, Camera, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DEFAULT_CATEGORIES = [
  "Groceries", "Dining", "Transportation", "Shopping", "Healthcare",
  "Entertainment", "Utilities", "Travel", "Gas", "Other"
]

export default function QuickAddExpense() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  // Scan State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isScanning, setIsScanning] = useState(false)

  // Manual Entry State
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Other")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  // --- SCAN LOGIC ---
  const handleScanClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" })
      return
    }

    setIsScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string

        try {
          const response = await fetch("/api/process-receipt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64, userId: user.id }),
          })
          const result = await response.json()

          if (result.success) {
            toast({ title: "Receipt Processed!", description: "Expense added successfully." })
            router.refresh()
            window.dispatchEvent(new Event('expense-added'))
          } else {
            throw new Error(result.error || "Failed to process")
          }
        } catch (error) {
          console.error(error)
          toast({ title: "Scan Failed", description: "Could not process receipt. Try manual entry.", variant: "destructive" })
        } finally {
          setIsScanning(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setIsScanning(false)
    }
  }

  // --- MANUAL ENTRY LOGIC ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !amount) return

    setIsSubmitting(true)
    try {
      // User requested NO default category name. 
      // Falling back to "Expense" only if absolutely empty to keep DB clean.
      const finalDescription = description.trim() || "Expense"

      const { error } = await supabase.from("expenses").insert([{
        user_id: user.id,
        amount: parseFloat(amount),
        description: finalDescription,
        category,
        date: date,
        processing_status: "completed"
      }])

      if (error) throw error

      toast({ title: "Expense Added", description: `₹${amount} recorded.` })
      setIsManualOpen(false)
      setAmount("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])

      // Soft refresh
      router.refresh()
      window.dispatchEvent(new Event('expense-added'))
    } catch (error) {

      toast({ title: "Error", description: "Failed to save expense.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 1. Scan Receipt Button */}
      <Button
        onClick={handleScanClick}
        disabled={isScanning}
        className="h-20 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md rounded-xl transition-all"
      >
        {isScanning ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary-foreground" />
        ) : (
          <ScanLine className="w-6 h-6 stroke-[2.5]" />
        )}
        <span className="text-sm font-semibold">Scan Receipt</span>
      </Button>

      {/* Hidden Input for Scan */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 2. Manual Entry Dialog Trigger */}
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-1.5 border-dashed border-2 hover:border-primary/50 hover:bg-muted/40 rounded-xl"
          >
            <Pencil className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Manual Entry</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md top-[20%] translate-y-0">
          <DialogHeader>
            <DialogTitle>Add Expense Manually</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleManualSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7 text-lg"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="block w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Optional description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting || !amount}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Expense"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
