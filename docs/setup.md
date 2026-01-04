# Development Setup Guide

This guide will help you set up the Expense Tracker PWA for local development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **pnpm** (recommended) or npm
- **Git** for version control
- **Supabase CLI** (optional, for local development)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/expense-tracker-pwa.git
cd expense-tracker-pwa
```

### 2. Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Setup

Create your environment file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_google_ai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `/database/setup.sql`
4. Paste and run the script in the SQL Editor
5. Verify tables are created successfully

### 5. Start Development Server
```bash
pnpm dev
# or
npm run dev
```

Your app will be available at `http://localhost:3000`

## 🔧 Development Tools

### Package Manager
We recommend using **pnpm** for faster installs and better dependency management:
```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Add new dependency
pnpm add package-name

# Add dev dependency
pnpm add -D package-name
```

### Available Scripts
```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type checking
pnpm type-check

# Format code
pnpm format
```

## 🏗️ Project Structure

```
expense-tracker-pwa/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── expenses/          # Expense management
│   ├── budget/            # Budget planner
│   ├── needs/             # Shopping list
│   └── settings/          # User settings
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   ├── expenses/         # Expense-related components
│   └── budget/           # Budget components
├── lib/                   # Utility libraries
│   ├── supabase-client.ts # Supabase client configuration
│   └── utils.ts          # General utilities
├── database/             # Database setup
├── docs/                 # Documentation
└── public/               # Static assets
```

## 🔐 Authentication Setup

The app uses Supabase Authentication. To set up auth providers:

### 1. Configure Supabase Auth
1. Go to Authentication > Settings in your Supabase dashboard
2. Configure Site URL: `http://localhost:3000`
3. Add redirect URLs for production later

### 2. Enable Auth Providers
- **Email/Password** - Enabled by default
- **Google OAuth** - Optional, configure in Supabase dashboard
- **GitHub OAuth** - Optional, configure in Supabase dashboard

### 3. Database Triggers (Optional)
Set up automatic user creation:
```sql
-- Create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  
  -- Create user categories
  PERFORM create_user_categories(NEW.id::uuid);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🤖 AI Integration Setup

### 1. Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` as `GOOGLE_GEMINI_API_KEY`

### 2. Test AI Integration
Use the receipt upload feature to test:
1. Upload a receipt image
2. Check the browser console for AI processing logs
3. Verify extracted data appears correctly

## 🎨 Styling and UI

### Tailwind CSS
The project uses Tailwind CSS for styling:
- Configuration: `tailwind.config.js`
- Global styles: `app/globals.css`
- Custom utilities: `lib/utils.ts`

### shadcn/ui Components
UI components are from shadcn/ui:
```bash
# Add new component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

### Custom Themes
Theme configuration in `components/theme-provider.tsx`:
- Light/Dark mode support
- System preference detection
- Persistent theme selection

## 🧪 Testing

### Development Testing
1. **Manual Testing**
   - Create test expenses
   - Upload receipt images
   - Test budget features
   - Verify analytics

2. **API Testing**
   - Test `/api/process-receipt` endpoint
   - Verify database operations
   - Check AI response format

### Debugging Tools
- **React DevTools** - Component inspection
- **Supabase Dashboard** - Database queries
- **Browser DevTools** - Network and console logs

## 📱 PWA Development

### Service Worker
The PWA service worker is in `app/service-worker.ts`:
- Caches static assets
- Enables offline functionality
- Handles push notifications (future feature)

### PWA Manifest
Configuration in `public/manifest.json`:
- App icons and metadata
- Display mode and theme
- Start URL and scope

### Testing PWA Features
1. Build the production app: `pnpm build`
2. Start production server: `pnpm start`
3. Use Chrome DevTools > Lighthouse > PWA audit

## 🔍 Debugging Common Issues

### Database Connection Issues
```bash
# Check Supabase connection
curl -X GET 'your_supabase_url/rest/v1/' \
  -H "apikey: your_anon_key"
```

### AI Processing Failures
1. Check API key is valid
2. Verify image format (JPEG, PNG supported)
3. Check console for detailed error logs
4. Test with smaller images first

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
pnpm install

# Type checking
pnpm type-check
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Google Gemini AI Documentation](https://ai.google.dev/)

## 🤝 Getting Help

- Check existing [issues](https://github.com/yourusername/expense-tracker-pwa/issues)
- Read the [FAQ](./faq.md)
- Join [discussions](https://github.com/yourusername/expense-tracker-pwa/discussions)
- Contact maintainers for critical issues