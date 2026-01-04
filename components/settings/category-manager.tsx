"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, X, Edit2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-client"

const DEFAULT_CATEGORIES = [
  "Groceries",
  "Dining",
  "Transportation",
  "Shopping",
  "Healthcare",
  "Entertainment",
  "Utilities",
  "Travel",
  "Gas",
  "Other"
]

export function CategoryManager() {
  const supabase = createClient()
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [newCategory, setNewCategory] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_categories')
        .select('categories')
        .eq('user_id', user.id)
        .single()

      if (data?.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const saveCategoriesToDB = useCallback(async (updatedCategories: string[]) => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_categories')
        .upsert({
          user_id: user.id,
          categories: updatedCategories
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving categories:', error)
      toast.error("Failed to save categories")
      // Reload categories on error
      loadCategories()
    } finally {
      setSaving(false)
    }
  }, [supabase])

  function handleAddCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) {
      toast.error("Category name cannot be empty")
      return
    }
    if (categories.includes(trimmed)) {
      toast.error("Category already exists")
      return
    }

    const updated = [...categories, trimmed]
    setCategories(updated)
    saveCategoriesToDB(updated)
    setNewCategory("")
    toast.success("Category added")
  }

  function handleDeleteCategory(index: number) {
    const updated = categories.filter((_, i) => i !== index)
    setCategories(updated)
    saveCategoriesToDB(updated)
    toast.success("Category removed")
  }

  function startEditing(index: number) {
    setEditingIndex(index)
    setEditValue(categories[index])
  }

  function handleSaveEdit(index: number) {
    const trimmed = editValue.trim()
    if (!trimmed) {
      toast.error("Category name cannot be empty")
      return
    }
    if (categories.includes(trimmed) && categories[index] !== trimmed) {
      toast.error("Category already exists")
      return
    }

    const updated = [...categories]
    updated[index] = trimmed
    setCategories(updated)
    saveCategoriesToDB(updated)
    setEditingIndex(null)
    setEditValue("")
    toast.success("Category updated")
  }

  function handleResetToDefault() {
    setCategories(DEFAULT_CATEGORIES)
    saveCategoriesToDB(DEFAULT_CATEGORIES)
    setEditingIndex(null)
    setEditValue("")
    toast.success("Categories reset to default")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={handleAddCategory}
          disabled={loading || !newCategory.trim()}
          className="whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-sm px-3 py-1.5 flex items-center gap-2 group hover:bg-secondary/80"
              >
                {editingIndex === index ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                      className="h-6 w-32 text-xs"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="hover:text-green-600"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{category}</span>
                    <button
                      onClick={() => startEditing(index)}
                      className="text-muted-foreground hover:text-blue-600 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete Category"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToDefault}
          disabled={saving}
        >
          Reset to Default
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {saving ? "Saving..." : "Hover over categories to edit or delete. Changes are saved automatically."}
      </p>
    </div>
  )
}
