"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Landmark,
  Loader,
  ScanLine,
  PieChart,
  Zap,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  CreditCard,
  Wallet
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) return null

  const scrollToAuth = () => {
    const authSection = document.getElementById('auth-section')
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' })
      // Focus on the first input to give immediate feedback
      setTimeout(() => {
        const input = authSection.querySelector('input')
        if (input) input.focus()
      }, 800) // Wait for scroll
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Mexo</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</a>
            <Button onClick={scrollToAuth} className="rounded-full px-6">Get Started</Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b p-4 space-y-4 shadow-2xl animate-in slide-in-from-top-5">
            <Button onClick={scrollToAuth} className="w-full">Get Started</Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col justify-center pt-8 pb-12 lg:py-20">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Typography */}
          <div className="space-y-10 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0 shadow-sm transition-transform hover:scale-105 cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                AI-Powered Finance
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Master Your Money <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient">
                  Effortlessly.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience the future of expense tracking. Simply snap a receipt, and our AI handles the categorization, analytics, and budgeting for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={scrollToAuth} className="w-full sm:w-auto px-10 h-14 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                Start for Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <div className="flex items-center gap-6 px-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Free forever</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Glass Card */}
          <div id="auth-section" className="relative perspective-1000">
            {/* Context Floating Icons */}
            <div className="absolute -left-12 top-0 hidden lg:block animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="p-4 bg-background/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/10">
                <Wallet className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="absolute -right-8 bottom-20 hidden lg:block animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="p-4 bg-background/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/10">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
            </div>

            <Card className="relative w-full max-w-md mx-auto p-1 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 shadow-2xl backdrop-blur-xl">
              <div className="bg-background/90 rounded-[22px] p-8 h-full">
                <div className="text-center mb-8">
                  <div className="inline-flex justify-center items-center w-12 h-12 bg-primary/10 rounded-2xl mb-4 text-primary">
                    {isSignup ? <ScanLine className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {isSignup ? "Create Account" : "Welcome Back"}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {isSignup ? "Join thousands managing their wealth" : "Access your financial dashboard"}
                  </p>
                </div>

                {isSignup ? (
                  <>
                    <SignupForm />
                    <p className="text-center mt-6 text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button onClick={() => setIsSignup(false)} className="text-primary hover:underline font-semibold transition-colors">
                        Log In
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <LoginForm />
                    <p className="text-center mt-6 text-sm text-muted-foreground">
                      New to Mexo?{" "}
                      <button onClick={() => setIsSignup(true)} className="text-primary hover:underline font-semibold transition-colors">
                        Sign Up
                      </button>
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-10 border-y bg-muted/20">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h4 className="text-3xl font-bold text-foreground">₹50L+</h4>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Tracked</p>
          </div>
          <div>
            <h4 className="text-3xl font-bold text-foreground">10k+</h4>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Users</p>
          </div>
          <div>
            <h4 className="text-3xl font-bold text-foreground">99%</h4>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">AI Accuracy</p>
          </div>
          <div>
            <h4 className="text-3xl font-bold text-foreground">4.9/5</h4>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Rating</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need</h2>
            <p className="text-xl text-muted-foreground">Powerful features wrapped in a beautiful interface.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ScanLine, title: "Snap & Extract", desc: "Take a photo of any receipt. We extract merchant, date, and items instantly." },
              { icon: PieChart, title: "Visual Analytics", desc: "Interactive charts show you exactly where your money is going." },
              { icon: Zap, title: "Auto-Categorize", desc: "Transactions are automatically categorized based on merchant data." },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center mb-6 shadow-sm border group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="pt-24 pb-12 border-t bg-muted/10 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How it works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to financial mastery.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent dashed-line" />

            <div className="relative text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-background rounded-full flex items-center justify-center border-4 border-muted shadow-xl relative z-10">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold">Snap Receipt</h3>
              <p className="text-muted-foreground">Take a photo of your receipt. Our AI instantly scans and reads every detail.</p>
            </div>

            <div className="relative text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-background rounded-full flex items-center justify-center border-4 border-muted shadow-xl relative z-10">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold">Review Data</h3>
              <p className="text-muted-foreground">Verify the extracted info. Categorization is automatic and smart.</p>
            </div>

            <div className="relative text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-background rounded-full flex items-center justify-center border-4 border-muted shadow-xl relative z-10">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold">See Insights</h3>
              <p className="text-muted-foreground">Your budget and charts update instantly. You stay in control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-t bg-card mt-auto">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-2">
            <a
              href="https://github.com/narenkarthikx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors"
            >
              <span className="font-mono text-xs text-primary font-bold">Built by narenkarthikx</span>
            </a>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Mexo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
