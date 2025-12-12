"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase-client"
import { Plus, Upload, Loader2, Camera, Pencil } from "lucide-react"

const DEFAULT_CATEGORIES = [
  "Groceries", "Dining", "Transportation", "Shopping", "Healthcare", 
  "Entertainment", "Utilities", "Travel", "Gas", "Other"
]

export default function SimpleExpenseForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Load user categories on mount
  useEffect(() => {
    loadCategories()
  }, [user])

  async function loadCategories() {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_categories')
        .select('categories')
        .eq('user_id', user.id)
        .single()

      if (data?.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.log('Using default categories')
    }
  }

  // Check camera support on mount
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraSupported(false)
          return
        }
        // Check if camera permission is available
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasCamera = devices.some(device => device.kind === 'videoinput')
        setCameraSupported(hasCamera)
      } catch (err) {
        setCameraSupported(false)
      }
    }
    checkCameraSupport()
  }, [])

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
    
    console.log("handleReceiptUpload triggered", {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      source: e.target === cameraInputRef.current ? 'camera' : 'file'
    })
    
    if (!file) {
      console.log("No file selected")
      return
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload receipts",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error("Invalid file type:", file.type)
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error("File too large:", file.size)
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      })
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
      return
    }

    console.log("File validation passed, processing...")
    await processReceipt(file)
    
    // Reset inputs after processing
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  // Process receipt image (shared by both upload and camera)
  const processReceipt = async (file: File) => {
    if (!user) return
    
    console.log("Starting receipt upload:", file.name, "Size:", file.size)
    setReceiptLoading(true)

    try {
      // Compress image if from camera or if large
      let processedFile = file
      if (file.size > 1 * 1024 * 1024) { // If larger than 1MB
        console.log("Compressing large image...")
        processedFile = await compressImage(file)
        console.log("Compressed size:", processedFile.size)
      }

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
              description: result.message || "Expense added successfully",
            })
            setTimeout(() => window.location.reload(), 2000)
          } else {
            // Show more helpful error for rate limits
            const errorMsg = result.error || "Could not process receipt"
            const isRateLimit = errorMsg.toLowerCase().includes('quota') || 
                               errorMsg.toLowerCase().includes('limit') ||
                               errorMsg.toLowerCase().includes('rate')
            
            toast({
              title: isRateLimit ? "⏳ Rate Limit" : "❌ Processing Failed",
              description: isRateLimit 
                ? "API limit reached. Please try again in a few minutes or use manual entry."
                : errorMsg,
              variant: "destructive",
            })
          }
        } catch (fetchError) {
          console.error("API call failed:", fetchError)
          toast({
            title: "❌ Upload Failed",
            description: "Could not connect to AI service. Please try manual entry.",
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

      reader.readAsDataURL(processedFile)
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

  // Compress image to reduce size
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Resize if too large
          const maxDimension = 1200
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            0.8 // 80% quality
          )
        }
        img.onerror = () => resolve(file)
        img.src = e.target?.result as string
      }
      reader.onerror = () => resolve(file)
      reader.readAsDataURL(file)
    })
  }

  const handleCameraClick = () => {
    console.log("Camera button clicked", {
      cameraSupported,
      inputExists: !!cameraInputRef.current,
      disabled: receiptLoading
    })
    
    if (!cameraSupported) {
      toast({
        title: "Camera not available",
        description: "Your device doesn't support camera capture",
        variant: "destructive",
      })
      return
    }
    
    // Directly trigger camera without toast (toast might block on mobile)
    console.log("Triggering camera input click...")
    cameraInputRef.current?.click()
    console.log("Camera input clicked")
  }

  const handleFileClick = () => {
    console.log("File button clicked", {
      inputExists: !!fileInputRef.current,
      disabled: receiptLoading
    })
    fileInputRef.current?.click()
  }

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Please log in to add expenses</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* AI Scan - Priority Method */}
      <Card className="p-5 border-2 border-primary/30 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              AI Scan
            </h3>
            <Badge className="bg-primary/10 text-primary border-primary/20">Recommended</Badge>
          </div>
          
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleReceiptUpload}
            disabled={receiptLoading}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleReceiptUpload}
            disabled={receiptLoading}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={handleCameraClick}
              disabled={receiptLoading || !cameraSupported}
              className="h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!cameraSupported ? "Camera not available on this device" : "Take a photo of your receipt"}
            >
              <Camera className="w-4 h-4 mr-2" />
              {cameraSupported ? 'Take Photo' : 'No Camera'}
            </Button>
            
            <Button
              type="button"
              onClick={handleFileClick}
              disabled={receiptLoading}
              variant="outline"
              className="h-11 border-primary/30 hover:border-primary hover:bg-primary/5"
              title="Select a receipt image from your device"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>
          
          {receiptLoading && (
            <div className="flex items-center gap-2 text-primary text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI processing receipt...</span>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground leading-relaxed">
            📸 Capture with camera or 📤 upload from device • AI extracts details automatically
          </p>
        </div>
      </Card>

      {/* Manual Entry - Alternative Method */}
      <Card className="p-5 border border-border bg-gradient-to-br from-card to-muted/20">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Pencil className="w-5 h-5 text-green-600" />
              Manual Entry
            </h3>
            <Badge variant="outline" className="text-xs">Quick Add</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">Category</label>
              <Select value={category} onValueChange={setCategory} disabled={loading}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 h-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Description (Optional)</label>
            <Input
              type="text"
              placeholder="e.g., Lunch at cafe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10"
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || !amount}
            className="w-full h-10"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Add Expense
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}