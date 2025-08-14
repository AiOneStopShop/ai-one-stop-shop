#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTables() {
  console.log('🗄️ Creating visitor and subscriber tables in Supabase...\n')
  
  try {
    // Create visitors table
    console.log('📊 Creating visitors table...')
    const { error: visitorsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS visitors (
          id BIGSERIAL PRIMARY KEY,
          session_id TEXT UNIQUE NOT NULL,
          ip_address INET,
          user_agent TEXT,
          referrer TEXT,
          landing_page TEXT,
          utm_source TEXT,
          utm_medium TEXT,
          utm_campaign TEXT,
          utm_term TEXT,
          utm_content TEXT,
          country TEXT,
          city TEXT,
          region TEXT,
          timezone TEXT,
          device_type TEXT,
          browser TEXT,
          os TEXT,
          screen_resolution TEXT,
          language TEXT,
          first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          visit_count INTEGER DEFAULT 1,
          total_time_on_site INTEGER DEFAULT 0,
          pages_viewed INTEGER DEFAULT 1,
          is_bounce BOOLEAN DEFAULT true,
          conversion_goal TEXT,
          conversion_value DECIMAL(10,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (visitorsError) {
      console.log('⚠️ Visitors table might already exist or there was an error:', visitorsError.message)
    } else {
      console.log('✅ Visitors table created successfully!')
    }

    // Create subscribers table
    console.log('\n📧 Creating subscribers table...')
    const { error: subscribersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS subscribers (
          id BIGSERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          company TEXT,
          job_title TEXT,
          industry TEXT,
          interests TEXT[],
          persona TEXT,
          budget_range TEXT,
          use_case TEXT[],
          source TEXT,
          utm_source TEXT,
          utm_medium TEXT,
          utm_campaign TEXT,
          utm_term TEXT,
          utm_content TEXT,
          ip_address INET,
          country TEXT,
          city TEXT,
          region TEXT,
          timezone TEXT,
          device_type TEXT,
          browser TEXT,
          os TEXT,
          language TEXT,
          subscription_status TEXT DEFAULT 'active',
          email_verified BOOLEAN DEFAULT false,
          verification_token TEXT,
          verification_expires_at TIMESTAMP WITH TIME ZONE,
          unsubscribe_token TEXT,
          last_email_sent_at TIMESTAMP WITH TIME ZONE,
          email_open_count INTEGER DEFAULT 0,
          email_click_count INTEGER DEFAULT 0,
          total_emails_sent INTEGER DEFAULT 0,
          preferences JSONB DEFAULT '{}',
          tags TEXT[],
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (subscribersError) {
      console.log('⚠️ Subscribers table might already exist or there was an error:', subscribersError.message)
    } else {
      console.log('✅ Subscribers table created successfully!')
    }

    // Create visitor_events table for tracking user interactions
    console.log('\n📈 Creating visitor_events table...')
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS visitor_events (
          id BIGSERIAL PRIMARY KEY,
          session_id TEXT NOT NULL,
          visitor_id BIGINT REFERENCES visitors(id),
          event_type TEXT NOT NULL,
          event_name TEXT NOT NULL,
          page_url TEXT,
          page_title TEXT,
          element_id TEXT,
          element_class TEXT,
          element_text TEXT,
          custom_data JSONB,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (eventsError) {
      console.log('⚠️ Visitor_events table might already exist or there was an error:', eventsError.message)
    } else {
      console.log('✅ Visitor_events table created successfully!')
    }

    // Create indexes for better performance
    console.log('\n🔍 Creating indexes...')
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Visitors table indexes
        CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
        CREATE INDEX IF NOT EXISTS idx_visitors_ip_address ON visitors(ip_address);
        CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at);
        CREATE INDEX IF NOT EXISTS idx_visitors_utm_source ON visitors(utm_source);
        CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
        CREATE INDEX IF NOT EXISTS idx_visitors_device_type ON visitors(device_type);
        
        -- Subscribers table indexes
        CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
        CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(subscription_status);
        CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);
        CREATE INDEX IF NOT EXISTS idx_subscribers_persona ON subscribers(persona);
        CREATE INDEX IF NOT EXISTS idx_subscribers_interests ON subscribers USING GIN(interests);
        CREATE INDEX IF NOT EXISTS idx_subscribers_use_case ON subscribers USING GIN(use_case);
        
        -- Visitor events table indexes
        CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id ON visitor_events(session_id);
        CREATE INDEX IF NOT EXISTS idx_visitor_events_visitor_id ON visitor_events(visitor_id);
        CREATE INDEX IF NOT EXISTS idx_visitor_events_event_type ON visitor_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_visitor_events_timestamp ON visitor_events(timestamp);
        CREATE INDEX IF NOT EXISTS idx_visitor_events_page_url ON visitor_events(page_url);
      `
    })

    if (indexesError) {
      console.log('⚠️ Some indexes might already exist or there was an error:', indexesError.message)
    } else {
      console.log('✅ Indexes created successfully!')
    }

    // Create RLS policies for security
    console.log('\n🔒 Creating Row Level Security policies...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on all tables
        ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
        ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;
        
        -- Visitors table policies
        CREATE POLICY "Allow public read access to visitors" ON visitors
          FOR SELECT USING (true);
        
        CREATE POLICY "Allow public insert access to visitors" ON visitors
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Allow public update access to visitors" ON visitors
          FOR UPDATE USING (true);
        
        -- Subscribers table policies
        CREATE POLICY "Allow public read access to subscribers" ON subscribers
          FOR SELECT USING (true);
        
        CREATE POLICY "Allow public insert access to subscribers" ON subscribers
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Allow public update access to subscribers" ON subscribers
          FOR UPDATE USING (true);
        
        -- Visitor events table policies
        CREATE POLICY "Allow public read access to visitor_events" ON visitor_events
          FOR SELECT USING (true);
        
        CREATE POLICY "Allow public insert access to visitor_events" ON visitor_events
          FOR INSERT WITH CHECK (true);
      `
    })

    if (rlsError) {
      console.log('⚠️ Some RLS policies might already exist or there was an error:', rlsError.message)
    } else {
      console.log('✅ Row Level Security policies created successfully!')
    }

    console.log('\n🎉 Database tables setup complete!')
    console.log('\n📋 Tables created:')
    console.log('   • visitors - Track website visitors and analytics')
    console.log('   • subscribers - Manage email subscribers and preferences')
    console.log('   • visitor_events - Track user interactions and events')
    console.log('\n🔍 Next steps:')
    console.log('   1. Create API routes for visitor tracking')
    console.log('   2. Create API routes for subscriber management')
    console.log('   3. Add tracking scripts to your frontend')
    console.log('   4. Set up email marketing integration')

  } catch (error) {
    console.log('❌ Error creating tables:', error.message)
    console.log('\n💡 Alternative: You can create these tables manually in your Supabase dashboard:')
    console.log('   1. Go to your Supabase dashboard')
    console.log('   2. Click "SQL Editor"')
    console.log('   3. Run the SQL commands manually')
  }
}

createTables()
