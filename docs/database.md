# Database Setup Guide

This guide covers the complete database setup for the Expense Tracker PWA using Supabase.

## 🏗️ Database Architecture

The application uses PostgreSQL with the following main tables:
- **users** - User accounts and profiles
- **categories** - Expense categories (system and user-defined)
- **expenses** - All expense records with AI processing support
- **budgets** - Budget limits and tracking
- **wishlist** - User wishlist/needs tracking

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
1. Open your Supabase SQL editor
2. Copy and paste the entire content of `/database/setup.sql`
3. Run the script - it will create all tables, indexes, functions, and test data

### Option 2: Manual Setup
If you prefer to understand each step:

1. **Enable UUID Extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Create Tables**
   - Run each table creation from the setup script individually
   - Verify each table is created successfully

3. **Create Indexes**
   - Add all performance indexes for optimal query performance

4. **Insert System Data**
   - Add predefined categories and test data

## 🔧 Database Schema Details

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Expenses Table (with AI Support)
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(500),
  category VARCHAR(100), -- For backward compatibility
  category_id UUID REFERENCES categories(id),
  receipt_url VARCHAR(500),
  extracted_data JSONB, -- AI-extracted receipt data
  ai_confidence DECIMAL(3, 2), -- AI confidence (0.00-1.00)
  processing_status VARCHAR(50) DEFAULT 'completed',
  merchant VARCHAR(255), -- Store/merchant name
  payment_method VARCHAR(100),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Categories System
- **system_categories** - Predefined category templates
- **categories** - User-specific categories (created from system templates)

## 🛠️ Helper Functions

### `create_user_categories(user_id)`
Automatically creates all system categories for a new user:
```sql
SELECT create_user_categories('your-user-id');
```

### `get_or_create_user(id, email, name)`
Creates or updates a user and sets up their categories:
```sql
SELECT get_or_create_user(
  'user-id',
  'user@example.com',
  'User Name'
);
```

## 📊 Performance Optimizations

The setup includes indexes for:
- User-based queries (`user_id` indexes)
- Date-based filtering (`date` indexes)
- AI processing status tracking
- Category lookups
- Merchant searching

## 🔍 Verification

After setup, verify your database:

1. **Check Tables**
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE tablename IN ('users', 'categories', 'expenses', 'budgets', 'wishlist');
   ```

2. **Check Test Data**
   ```sql
   SELECT * FROM users WHERE email = 'test@example.com';
   SELECT COUNT(*) as category_count FROM categories;
   SELECT COUNT(*) as expense_count FROM expenses;
   ```

3. **Verify Functions**
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_type = 'FUNCTION' 
   AND routine_name IN ('create_user_categories', 'get_or_create_user');
   ```

## 🔐 Security Considerations

### Row Level Security (RLS)
For production, enable RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Example policy for expenses (users can only see their own)
CREATE POLICY "Users can view own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);
```

### API Security
- Use Supabase's built-in authentication
- Implement proper JWT token validation
- Use service role key only for server-side operations

## 🧪 Test Data

The setup script includes:
- Test user: `test@example.com`
- Sample expense for verification
- All system categories

Remove test data in production:
```sql
DELETE FROM expenses WHERE user_id = 'c90ad114-9182-4faa-93b1-1aec40c2c10a';
DELETE FROM users WHERE email = 'test@example.com';
```

## 📝 Migration Notes

### From Previous Versions
If upgrading from an older schema:

1. **Backup your data** first
2. Run the complete setup script (it uses `IF NOT EXISTS`)
3. Migrate existing data if needed
4. Test thoroughly before going live

### Adding New Fields
When adding fields for AI processing:
```sql
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3, 2),
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'completed';
```

## 🆘 Troubleshooting

### Common Issues

1. **UUID Extension Missing**
   ```
   ERROR: function uuid_generate_v4() does not exist
   ```
   **Solution**: Enable the UUID extension first

2. **Permission Denied**
   ```
   ERROR: permission denied for table users
   ```
   **Solution**: Check your Supabase role permissions

3. **Foreign Key Constraints**
   ```
   ERROR: insert or update violates foreign key constraint
   ```
   **Solution**: Ensure parent records exist (users before expenses)

### Reset Database
To start fresh:
```sql
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS system_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```
Then re-run the setup script.

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)