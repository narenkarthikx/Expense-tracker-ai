# 💰 Mexo - My Expenses Optimized

> **AI-Powered Financial Intelligence. Effortless Tracking.**

A premium Progressive Web App (PWA) built with **Next.js 15**, **Supabase**, and **Google Gemini AI** to automate your financial life. Snap a receipt, and Mexo handles the rest.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-orange)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Why Mexo?

Mexo isn't just an expense tracker; it's your personal financial assistant. We've replaced manual data entry with state-of-the-art AI.

### 🤖 Intelligent Automation
- **Snap & Forget**: Take a photo of any receipt. Google Gemini 2.5 Flash extracts merchant, items, date, total, and categorizes it instantly.
- **Smart Categorization**: AI learns your habits. "Walmart" goes to *Groceries*, "Shell" goes to *Gas*—automatically.
- **Detailed Parsing**: Captures individual line items (e.g., "2x Milk", "Bread") for granular insights.

### 💎 Premium Experience
- **Stunning UI**: A redesign focused on aesthetics ("Wow" factor), featuring glassmorphism, aurora gradients, and smooth animations.
- **Progressive Web App (PWA)**: Installable on iOS and Android. Works offline.
- **Dark Mode**: Beautiful, deep-dark theme optimized for OLED screens.
- **Indian Rupee (₹)**: fully localized for Indian users (₹ symbol default).

### 📊 Powerful Financial Tools
- **Deep Analytics**: Interactive charts for monthly spending trends and category breakdowns.
- **Smart Budgets**: Set monthly limits per category. Visual cards show available funds and health status.
- **Shopping List (Needs)**: Plan purchases before you spend. Calculate budget impact *before* buying.
- **Custom Categories**: fully customizable category system to match your lifestyle.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account ([free tier available](https://supabase.com))
- Google Gemini API key ([get one free](https://ai.google.dev/))

### Installation

```bash
# Clone repository
git clone https://github.com/narenkarthikx/Expense-tracker-ai.git
cd "Mexo - My Expenses Optimized"

# Install dependencies
pnpm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your credentials (SUPABASE_URL, ANON_KEY, GEMINI_API_KEY)

# Setup database
# Run database/setup.sql in your Supabase SQL Editor

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to start your financial journey.

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Core** | Next.js 15 (App Router), React 19 |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS 3, Shadcn/ui, Framer Motion |
| **Backend** | Supabase (PostgreSQL, Realtime, Auth) |
| **AI Engine** | Google Gemini 2.5 Flash |
| **State** | React Hooks, Context API |
| **Deploy** | Vercel |

---

## 📂 Project Structure

A clean, modern architecture for scalability:

```text
├── app/                  # Application Routes (The "Rooms")
│   ├── analytics/        # Analytics Dashboard
│   ├── budget/           # Budget Planner
│   ├── dashboard/        # Main User Hub
│   ├── expenses/         # Expense List & Smart Filters
│   ├── needs/            # Shopping List (Wishlist)
│   └── settings/         # User Preferences
├── components/           # Building Blocks (The "Furniture")
│   ├── analytics/        # Charts & Visuals
│   ├── auth/             # Login/Signup Forms
│   ├── budget/           # Budget Managers & Cards
│   ├── dashboard/        # Quick Actions & Overview Widgets
│   ├── expenses/         # Expense Item Cards & Forms
│   └── ui/               # Reusable Shadcn Components
└── lib/                  # Utilities & AI Logic
```

---

## 🌟 Recent Changelog (Jan 2026)

### Major Overhaul
- **Design Refresh**: Complete Landing Page redesign with "Aurora" visuals and 3D glass cards.
- **Codebase Clean**: Removed all duplicate files and unused components (`budget-charts`, `pdf-export`, etc.).
- **Currency Update**: Standardized entire app to use Indian Rupee (₹).

### New Features
- **Needs/Shopping List**: A dedicated page to plan future purchases and see their budget impact.
- **Budget v2**: Compact, health-focused budget cards with direct deletion and better progress visualization.
- **Smart Filters**: Expenses default to "This Month" for quicker access.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a PR.
1. Fork it
2. Create your feature branch (`git checkout -b feature/cool-feature`)
3. Commit your changes (`git commit -m 'Add cool feature'`)
4. Push to the branch (`git push origin feature/cool-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [narenkarthikx](https://github.com/narenkarthikx)**

[Demo](https://expense-tracker-ai.vercel.app) • [Issues](https://github.com/narenkarthikx/Expense-tracker-ai/issues)

</div>