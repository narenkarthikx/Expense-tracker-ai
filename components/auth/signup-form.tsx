"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-client"
import { Loader, Eye, EyeOff, User, Mail, Lock, CheckCircle2 } from "lucide-react"

export default function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!name || !email || !password || !confirmPassword) {
        setError("Please fill in all fields")
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }

      const supabase = createClient()
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data?.user && !data?.session) {
        setError("Please check your email for verification before signing in.")
        return
      }

      // If we have a session, the user is automatically signed in
      // The auth provider will handle the redirect
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up")
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = password.length >= 8 ? "strong" : password.length >= 6 ? "medium" : "weak"
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  return (
    <form onSubmit={handleSignup} className="space-y-4">{" "}
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User className="w-4 h-4" />
          </div>
          <Input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="h-10 pl-10 bg-gradient-to-br from-background to-muted/30 border-muted-foreground/20 hover:border-primary/40 focus:border-primary transition-all"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Mail className="w-4 h-4" />
          </div>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-10 pl-10 bg-gradient-to-br from-background to-muted/30 border-muted-foreground/20 hover:border-primary/40 focus:border-primary transition-all"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-10 pl-10 pr-10 bg-gradient-to-br from-background to-muted/30 border-muted-foreground/20 hover:border-primary/40 focus:border-primary transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <div className="flex gap-1 mt-1.5">
            <div className={`h-1 flex-1 rounded-full transition-colors ${
              passwordStrength === "strong" ? "bg-green-500" : 
              passwordStrength === "medium" ? "bg-yellow-500" : "bg-red-500"
            }`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${
              passwordStrength === "strong" ? "bg-green-500" : 
              passwordStrength === "medium" ? "bg-yellow-500" : "bg-muted"
            }`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${
              passwordStrength === "strong" ? "bg-green-500" : "bg-muted"
            }`} />
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="h-10 pl-10 pr-10 bg-gradient-to-br from-background to-muted/30 border-muted-foreground/20 hover:border-primary/40 focus:border-primary transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {passwordsMatch && (
            <div className="absolute -right-8 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2.5 bg-gradient-to-r from-destructive/10 to-red-50 border border-destructive/30 rounded-lg text-xs text-destructive flex items-start gap-2">
          <span className="text-destructive font-bold">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full h-10 font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg shadow-primary/20 transition-all" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Password Requirements */}
      <div className="mt-3 p-2.5 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border border-muted-foreground/10">
        <p className="text-xs text-muted-foreground font-medium mb-1.5">Password requirements:</p>
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-muted-foreground"}`} />
            At least 6 characters
          </li>
          <li className="flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-muted-foreground"}`} />
            8+ characters for strong security
          </li>
        </ul>
      </div>
    </form>
  )
}
