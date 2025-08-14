#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase environment variables')
  console.log('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createTables() {
  console.log('🗄️ Creating visitor and subscriber tables in Supabase...\n')
  
  try {
    // Test connection first
    console.log('🔍 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('ai_tools')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Could not connect to Supabase:', testError.message)
      console.log('Please check your Supabase URL and API key')
      process.exit(1)
    }
    
    console.log('✅ Connected to Supabase successfully!')
    
    // Since we can't use exec_sql, we'll create the tables manually
    // You'll need to run these SQL commands in your Supabase dashboard
    
    console.log('\n📋 To create the tables, please follow these steps:')
    console.log('\n1. Go to your Supabase dashboard:')
    console.log(`   https://supabase.com/dashboard/project/jeukcomldafwrdrnadil`)
    console.log('\n2. Click "SQL Editor" in the left sidebar')
    console.log('\n3. Copy and paste the following SQL commands:')
    
    console.log('\n' + '='.repeat(80))
    console.log('SQL COMMANDS TO RUN IN SUPABASE DASHBOARD:')
    console.log('='.repeat(80))
    
    console.log(`
-- 1. Create visitors table
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

-- 2. Create subscribers table
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

-- 3. Create visitor_events table
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

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_ip_address ON visitors(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_utm_source ON visitors(utm_source);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_visitors_device_type ON visitors(device_type);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_persona ON subscribers(persona);
CREATE INDEX IF NOT EXISTS idx_subscribers_interests ON subscribers USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_subscribers_use_case ON subscribers USING GIN(use_case);

CREATE INDEX IF NOT EXISTS idx_visitor_events_session_id ON visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_visitor_id ON visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_event_type ON visitor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_timestamp ON visitor_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_visitor_events_page_url ON visitor_events(page_url);

-- 5. Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Allow public read access to visitors" ON visitors
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to visitors" ON visitors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to visitors" ON visitors
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to subscribers" ON subscribers
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to subscribers" ON subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to subscribers" ON subscribers
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to visitor_events" ON visitor_events
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to visitor_events" ON visitor_events
  FOR INSERT WITH CHECK (true);

-- 7. Create sample data for testing
INSERT INTO visitors (session_id, ip_address, user_agent, landing_page, country, device_type, browser, os) 
VALUES 
  ('test-session-1', '192.168.1.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '/', 'US', 'desktop', 'Chrome', 'macOS'),
  ('test-session-2', '192.168.1.2', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)', '/tools', 'CA', 'mobile', 'Safari', 'iOS')
ON CONFLICT (session_id) DO NOTHING;

INSERT INTO subscribers (email, first_name, last_name, company, persona, interests, budget_range) 
VALUES 
  ('john@example.com', 'John', 'Doe', 'Tech Corp', 'Tech-Savvy Sarah', ARRAY['AI tools', 'automation'], 'high'),
  ('jane@example.com', 'Jane', 'Smith', 'Startup Inc', 'Startup Steve', ARRAY['productivity', 'marketing'], 'medium')
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Tables created successfully! You now have:' as message,
       (SELECT COUNT(*) FROM visitors) as visitor_count,
       (SELECT COUNT(*) FROM subscribers) as subscriber_count;
`)
    
    console.log('\n' + '='.repeat(80))
    console.log('\n4. Click "Run" to execute the commands')
    console.log('\n5. You should see a success message with visitor and subscriber counts')
    
    console.log('\n🎯 After creating the tables, you can test them with:')
    console.log('\n# Test visitor tracking')
    console.log('curl -X POST "http://localhost:3002/api/visitors" \\')
    console.log('  -H "Content-Type: application/json" \\')
    console.log('  -d \'{"session_id":"test-123","user_agent":"test","landing_page":"/"}\'')
    
    console.log('\n# Test subscriber management')
    console.log('curl -X POST "http://localhost:3002/api/subscribers" \\')
    console.log('  -H "Content-Type: application/json" \\')
    console.log('  -d \'{"email":"test@example.com","first_name":"Test","persona":"Tech-Savvy Sarah"}\'')
    
    console.log('\n# Test event tracking')
    console.log('curl -X POST "http://localhost:3002/api/events" \\')
    console.log('  -H "Content-Type: application/json" \\')
    console.log('  -d \'{"session_id":"test-123","event_type":"click","event_name":"Test Click"}\'')
    
    console.log('\n📚 For more information, see: VISITOR_SUBSCRIBER_SETUP.md')

  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

createTables()
