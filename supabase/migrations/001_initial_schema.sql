-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  website_url TEXT NOT NULL,
  pricing_summary TEXT,
  pricing_model TEXT CHECK (pricing_model IN ('free', 'freemium', 'subscription', 'one-time', 'usage-based', 'contact')),
  has_free_tier BOOLEAN DEFAULT false,
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  logo_url TEXT,
  editorial_score INTEGER CHECK (editorial_score >= 1 AND editorial_score <= 100),
  editorial_why TEXT,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_sponsored BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool categories (many-to-many)
CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (tool_id, category_id)
);

-- Affiliate links (server-only, not exposed to browser)
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  go_slug TEXT UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  program_name TEXT,
  network TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate clicks (no raw IPs stored, only hashed)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  page_path TEXT,
  is_bot BOOLEAN DEFAULT false
);

-- User profiles (for future use with auth)
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (for future use)
CREATE TABLE IF NOT EXISTS subscriptions (
  stripe_subscription_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  price_id TEXT NOT NULL,
  plan TEXT CHECK (plan IN ('member', 'power')),
  interval TEXT CHECK (interval IN ('month', 'year')),
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe events (webhook deduplication)
CREATE TABLE IF NOT EXISTS stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Tool submissions (for public "Submit your tool" form)
CREATE TABLE IF NOT EXISTS tool_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  description TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(user_id)
);

-- Create indexes
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_last_verified ON tools(last_verified_at);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_affiliate_links_go_slug ON affiliate_links(go_slug);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);
CREATE INDEX idx_tool_categories_tool_id ON tool_categories(tool_id);
CREATE INDEX idx_tool_categories_category_id ON tool_categories(category_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

-- RLS Policies for tools (public read for published only)
CREATE POLICY "Anyone can read published tools"
  ON tools FOR SELECT
  USING (status = 'published');

-- RLS Policies for tool_categories (public read for published tools)
CREATE POLICY "Anyone can read tool categories for published tools"
  ON tool_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tools
      WHERE tools.id = tool_categories.tool_id
      AND tools.status = 'published'
    )
  );

-- Affiliate links should NOT be readable by the public (server-only)
-- No public SELECT policy

-- Affiliate clicks should NOT be readable by the public
-- No public SELECT policy

-- Profiles: users can read only their own
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions: users can read only their own
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

-- Tool submissions: allow public insert
CREATE POLICY "Anyone can submit tools"
  ON tool_submissions FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
