# 🎯 Visitor & Subscriber Tracking System

This document explains how to set up and use the visitor and subscriber tracking system for AI One Stop Shop.

## 📊 **Database Tables**

### **1. Visitors Table**
Tracks website visitors and their analytics data:

```sql
CREATE TABLE visitors (
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
```

### **2. Subscribers Table**
Manages email subscribers and their preferences:

```sql
CREATE TABLE subscribers (
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
```

### **3. Visitor Events Table**
Tracks user interactions and events:

```sql
CREATE TABLE visitor_events (
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
```

## 🚀 **Setup Instructions**

### **Step 1: Create Database Tables**
Run the SQL commands in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Click "SQL Editor"
3. Copy and paste the contents of `VISITOR_SUBSCRIBER_TABLES.sql`
4. Click "Run" to execute the commands

### **Step 2: Verify Tables Created**
Check that the tables were created successfully:

```bash
# Check visitors table
curl "http://localhost:3002/api/visitors" | jq '.count'

# Check subscribers table  
curl "http://localhost:3002/api/subscribers" | jq '.count'

# Check events table
curl "http://localhost:3002/api/events" | jq '.count'
```

## 🔧 **API Endpoints**

### **Visitors API (`/api/visitors`)**

#### **POST** - Track a new visitor
```javascript
const response = await fetch('/api/visitors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'unique-session-id',
    user_agent: navigator.userAgent,
    landing_page: '/',
    utm_source: 'google',
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'macOS'
  })
})
```

#### **GET** - Fetch visitors
```javascript
// Get all visitors
const response = await fetch('/api/visitors')

// Get specific visitor
const response = await fetch('/api/visitors?session_id=abc123')

// Get with pagination
const response = await fetch('/api/visitors?limit=10&offset=0')
```

### **Subscribers API (`/api/subscribers`)**

#### **POST** - Add/update subscriber
```javascript
const response = await fetch('/api/subscribers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    first_name: 'John',
    last_name: 'Doe',
    persona: 'Tech-Savvy Sarah',
    interests: ['AI tools', 'automation'],
    budget_range: 'high'
  })
})
```

#### **PUT** - Verify email or unsubscribe
```javascript
// Verify email
const response = await fetch('/api/subscribers', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    action: 'verify',
    token: 'verification-token'
  })
})

// Unsubscribe
const response = await fetch('/api/subscribers', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    action: 'unsubscribe',
    token: 'unsubscribe-token'
  })
})
```

### **Events API (`/api/events`)**

#### **POST** - Track an event
```javascript
const response = await fetch('/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'unique-session-id',
    visitor_id: 123,
    event_type: 'click',
    event_name: 'Tool Click',
    element_id: 'chatgpt-card',
    custom_data: { tool_name: 'ChatGPT', category: 'AI Chat' }
  })
})
```

## 🎣 **React Hooks**

### **useVisitorTracking Hook**
Automatically tracks page views and provides event tracking functions:

```javascript
import { useVisitorTracking } from '@/hooks/useVisitorTracking'

function MyComponent() {
  const { 
    sessionId, 
    visitorId, 
    trackEvent, 
    trackClick, 
    trackToolInteraction 
  } = useVisitorTracking()

  const handleToolClick = (toolName) => {
    trackToolInteraction(toolName, 'click', { 
      category: 'AI Tools',
      price: '$20/month' 
    })
  }

  return (
    <button onClick={() => handleToolClick('ChatGPT')}>
      Learn More
    </button>
  )
}
```

### **useSubscriberManagement Hook**
Manages newsletter subscriptions:

```javascript
import { useSubscriberManagement } from '@/hooks/useSubscriberManagement'

function NewsletterSignup() {
  const { subscribe, isLoading, error, success } = useSubscriberManagement()

  const handleSubmit = async (email, firstName) => {
    const result = await subscribe({
      email,
      first_name: firstName,
      persona: 'Tech-Savvy Sarah',
      interests: ['AI tools', 'productivity']
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

## 📈 **Event Types**

### **Built-in Event Types**
- `page_view` - When a user visits a page
- `click` - When a user clicks an element
- `form_submit` - When a user submits a form
- `tool_interaction` - When a user interacts with a tool
- `subscription` - When a user subscribes to newsletter

### **Custom Event Tracking**
```javascript
// Track custom events
trackEvent({
  event_type: 'purchase_intent',
  event_name: 'Add to Toolkit',
  element_id: 'budget-builder',
  custom_data: {
    tool_name: 'ChatGPT',
    budget_tier: 'Starter',
    total_value: 50
  }
})
```

## 🔍 **Analytics Queries**

### **Popular Pages**
```sql
SELECT 
  page_url,
  COUNT(*) as page_views
FROM visitor_events 
WHERE event_type = 'page_view'
GROUP BY page_url 
ORDER BY page_views DESC;
```

### **Top Converting Tools**
```sql
SELECT 
  custom_data->>'tool_name' as tool_name,
  COUNT(*) as interactions
FROM visitor_events 
WHERE event_type = 'tool_interaction'
GROUP BY tool_name 
ORDER BY interactions DESC;
```

### **Subscriber Demographics**
```sql
SELECT 
  persona,
  budget_range,
  COUNT(*) as subscriber_count
FROM subscribers 
WHERE subscription_status = 'active'
GROUP BY persona, budget_range
ORDER BY subscriber_count DESC;
```

### **Visitor Journey Analysis**
```sql
SELECT 
  v.session_id,
  v.landing_page,
  v.pages_viewed,
  v.visit_count,
  COUNT(ve.id) as total_events
FROM visitors v
LEFT JOIN visitor_events ve ON v.session_id = ve.session_id
GROUP BY v.session_id, v.landing_page, v.pages_viewed, v.visit_count
ORDER BY total_events DESC;
```

## 🎯 **Integration Examples**

### **Track Tool Clicks**
```javascript
// In your tool card component
const handleToolClick = (tool) => {
  trackToolInteraction(tool.name, 'click', {
    category: tool.category,
    price: tool.price,
    rating: tool.rating
  })
  
  // Navigate to affiliate link
  window.open(tool.affiliateLink, '_blank')
}
```

### **Track Budget Builder Usage**
```javascript
// In your budget builder component
const handleAddTool = (tool, tier) => {
  trackEvent({
    event_type: 'budget_builder',
    event_name: 'Add Tool to Budget',
    element_id: 'budget-builder',
    custom_data: {
      tool_name: tool.name,
      budget_tier: tier.name,
      tier_price: tier.maxBudget,
      current_total: calculateTotal()
    }
  })
}
```

### **Track Persona Selection**
```javascript
// In your persona guide component
const handlePersonaSelect = (persona) => {
  trackEvent({
    event_type: 'persona_selection',
    event_name: 'Persona Selected',
    element_id: persona.name,
    custom_data: {
      persona_name: persona.name,
      persona_budget: persona.budget,
      persona_interests: persona.interests
    }
  })
}
```

## 📊 **Dashboard Integration**

### **Key Metrics to Track**
1. **Visitor Analytics**
   - Total visitors
   - New vs returning visitors
   - Page views per session
   - Bounce rate
   - Time on site

2. **Tool Performance**
   - Most viewed tools
   - Most clicked tools
   - Conversion rate by tool
   - Revenue per tool

3. **Subscriber Growth**
   - New subscribers per day/week
   - Subscriber personas
   - Email open rates
   - Unsubscribe rates

4. **User Journey**
   - Landing page performance
   - User flow through site
   - Conversion funnels
   - Exit pages

## 🔒 **Privacy & Compliance**

### **GDPR Compliance**
- Store only necessary data
- Provide clear privacy policy
- Allow users to request data deletion
- Implement proper consent mechanisms

### **Data Retention**
- Set up automatic data cleanup
- Archive old visitor data
- Maintain subscriber data as long as active

### **Security**
- Use Row Level Security (RLS) policies
- Encrypt sensitive data
- Regular security audits
- Monitor for suspicious activity

## 🚀 **Next Steps**

1. **Set up the database tables** using the SQL file
2. **Test the API endpoints** with sample data
3. **Integrate tracking hooks** into your components
4. **Set up analytics dashboard** to visualize data
5. **Configure email marketing** integration
6. **Monitor and optimize** based on data insights

## 📞 **Support**

If you need help with the visitor and subscriber tracking system:

1. Check the API responses for error messages
2. Verify your Supabase connection
3. Test with the provided examples
4. Review the database schema
5. Check the browser console for JavaScript errors

The system is designed to be robust and scalable, providing valuable insights into your AI One Stop Shop's performance and user behavior.
