# 🗄️ Supabase Integration Setup Guide

This guide will help you set up Supabase as your database for AI One Stop Shop.

## 📋 **Prerequisites**

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Project Creation**: Create a new project
3. **Environment Variables**: Get your project URL and API keys

## 🚀 **Step 1: Create Your Supabase Project**

### **1. Go to Supabase**
- Visit [supabase.com](https://supabase.com)
- Sign up or log in to your account

### **2. Create New Project**
- Click **"New Project"**
- Choose your organization
- Enter project details:
  - **Name**: `ai-one-stop-shop`
  - **Database Password**: Choose a strong password
  - **Region**: Choose closest to your users

### **3. Wait for Setup**
- Supabase will set up your project (takes 1-2 minutes)
- You'll be redirected to the dashboard

## 📊 **Step 2: Get Your Project Credentials**

### **1. Go to Settings**
- In your Supabase dashboard, click **"Settings"** (gear icon)
- Click **"API"** in the sidebar

### **2. Copy Your Credentials**
You'll need these values:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ⚙️ **Step 3: Configure Environment Variables**

### **1. Update .env.local**
Add these variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Remove Airtable variables (no longer needed)
# AIRTABLE_API_KEY=...
# AIRTABLE_BASE_ID=...
```

### **2. Replace Placeholders**
- Replace `your-project-id` with your actual project ID
- Replace the anon key with your actual key

## 🗃️ **Step 4: Create Database Tables**

### **1. Go to SQL Editor**
- In your Supabase dashboard, click **"SQL Editor"**
- Click **"New Query"**

### **2. Create AI Tools Table**
Run this SQL:

```sql
-- Create AI Tools table
CREATE TABLE ai_tools (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  price TEXT DEFAULT 'Free',
  price_range TEXT CHECK (price_range IN ('free', 'freemium', 'paid', 'enterprise')) DEFAULT 'free',
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  image TEXT,
  affiliate_link TEXT,
  popularity INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
  use_case TEXT[] DEFAULT '{}',
  agent_type TEXT,
  capabilities TEXT[] DEFAULT '{}',
  integrations TEXT[] DEFAULT '{}',
  pricing_model TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'coming_soon')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_popularity ON ai_tools(popularity DESC);
CREATE INDEX idx_ai_tools_tags ON ai_tools USING GIN(tags);
CREATE INDEX idx_ai_tools_features ON ai_tools USING GIN(features);
```

### **3. Create Categories Table**
Run this SQL:

```sql
-- Create Categories table
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
```

### **4. Create Personas Table**
Run this SQL:

```sql
-- Create Personas table
CREATE TABLE personas (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  primary_interest TEXT,
  shopping_behavior TEXT,
  key_needs TEXT[] DEFAULT '{}',
  budget TEXT CHECK (budget IN ('low', 'medium', 'high')) DEFAULT 'medium',
  pain_points TEXT[] DEFAULT '{}',
  recommended_tools TEXT[] DEFAULT '{}',
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_personas_budget ON personas(budget);
```

### **5. Enable Row Level Security (Optional)**
If you want to add authentication later:

```sql
-- Enable RLS
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed)
CREATE POLICY "Allow public read access" ON ai_tools FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON personas FOR SELECT USING (true);
```

## 🔧 **Step 5: Test Your Setup**

### **1. Run the Migration Script**
```bash
npm run migrate:supabase
```

### **2. Test the API**
```bash
npm run dev
```

Then visit: `http://localhost:3001/api/tools`

### **3. Check Your Dashboard**
- Go to your Supabase dashboard
- Click **"Table Editor"**
- You should see your tables with data

## 📈 **Step 6: Configure Row Level Security (Optional)**

### **1. Enable Authentication**
If you want user authentication:
- Go to **"Authentication"** in your dashboard
- Configure your preferred auth providers

### **2. Set Up Policies**
Create policies to control data access:

```sql
-- Example: Allow authenticated users to insert tools
CREATE POLICY "Allow authenticated users to insert" ON ai_tools
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Example: Allow users to update their own tools
CREATE POLICY "Allow users to update own tools" ON ai_tools
FOR UPDATE USING (auth.uid() = created_by);
```

## 🚀 **Step 7: Deploy to Vercel**

### **1. Add Environment Variables to Vercel**
- Go to your Vercel project settings
- Add these environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **2. Deploy**
```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

## 📊 **Benefits of Supabase**

### **🎯 Database Features**
- **PostgreSQL**: Full SQL database with advanced features
- **Real-time**: Built-in real-time subscriptions
- **Auto-generated APIs**: REST and GraphQL APIs
- **Row Level Security**: Fine-grained access control

### **🚀 Performance**
- **Global CDN**: Fast access worldwide
- **Connection pooling**: Efficient database connections
- **Caching**: Built-in caching for better performance
- **Edge Functions**: Serverless functions at the edge

### **🔧 Developer Experience**
- **Dashboard**: Easy-to-use web interface
- **SQL Editor**: Write and execute SQL queries
- **TypeScript**: Full TypeScript support
- **CLI**: Command-line tools for development

## 🛠️ **Advanced Features**

### **Real-time Subscriptions**
```typescript
// Subscribe to tool updates
const subscription = supabase
  .from('ai_tools')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

### **Edge Functions**
Create serverless functions for complex operations:

```typescript
// supabase/functions/process-tools/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Your function logic here
  return new Response(JSON.stringify({ message: 'Hello World' }))
})
```

### **Database Backups**
- **Automatic backups**: Daily backups included
- **Point-in-time recovery**: Restore to any point in time
- **Manual backups**: Create backups on demand

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Connection Errors**
```
Error: Invalid API key
```
**Solution**: Check your environment variables

#### **Table Not Found**
```
Error: relation "ai_tools" does not exist
```
**Solution**: Run the SQL commands to create tables

#### **Permission Errors**
```
Error: new row violates row-level security policy
```
**Solution**: Check your RLS policies

### **Debug Mode**
Enable debug logging:
```typescript
const supabase = createClient(url, key, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})
```

## 📞 **Support**

If you need help with Supabase:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Join the [Supabase Discord](https://discord.supabase.com)
3. Review the error logs in your dashboard

---

**🎉 Congratulations! Your AI One Stop Shop is now powered by Supabase!**
