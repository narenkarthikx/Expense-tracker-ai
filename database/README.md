# Database Setup

This folder contains the complete database setup for the Expense Tracker PWA.

## Files

- `setup.sql` - **Single comprehensive database setup** (tested and working)

## Setup Instructions

### Quick Setup
1. Open your Supabase SQL Editor
2. Copy the entire content of `setup.sql`
3. Run the script - it will create everything needed:
   - ✅ All tables and relationships
   - ✅ AI processing fields  
   - ✅ Performance indexes
   - ✅ System categories
   - ✅ Helper functions
   - ✅ Test data and verification

### What's Included
This script combines all the working components:
- **Core Tables**: users, categories, expenses, budgets, wishlist
- **AI Features**: receipt processing fields, confidence scores
- **Performance**: Optimized indexes for fast queries
- **Categories**: Predefined system categories with auto-setup
- **Testing**: Built-in test data and verification queries

### Verification
After running the script, check the output to ensure:
- All tables created successfully
- Test user and categories exist
- Sample expense inserted correctly
- All verification queries return expected results

### Production Cleanup
Remove test data before going live:
```sql
DELETE FROM expenses WHERE user_id = 'c90ad114-9182-4faa-93b1-1aec40c2c10a';
DELETE FROM users WHERE email = 'test@example.com';
```

For detailed documentation, see `/docs/database.md`