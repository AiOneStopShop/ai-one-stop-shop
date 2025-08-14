# API Documentation
# AI One Stop Shop

**Version:** 1.0  
**Base URL:** `https://aionestop.shop/api` (Production) / `http://localhost:3002/api` (Development)  
**Last Updated:** August 14, 2024  

---

## 📋 **Overview**

This document provides comprehensive documentation for all API endpoints used in the AI One Stop Shop platform. The APIs are built using Next.js 14 API routes and Supabase as the backend database.

### **Authentication**
Currently, the APIs use public access with Row Level Security (RLS) policies configured in Supabase. Future versions will include JWT authentication.

### **Response Format**
All API responses follow this standard format:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string (optional),
  "count": number (optional)
}
```

### **Error Handling**
- **200**: Success
- **400**: Bad Request
- **404**: Not Found
- **500**: Internal Server Error

---

## 🛠️ **Tools API**

### **Base Endpoint:** `/api/tools`

#### **GET /api/tools**
Retrieve AI tools with optional filtering and pagination.

**Query Parameters:**
- `search` (string): Search tools by name, description, or tags
- `category` (string): Filter by tool category
- `subcategory` (string): Filter by tool subcategory
- `price_range` (string): Filter by price range (free, freemium, paid, enterprise)
- `difficulty` (string): Filter by difficulty level (beginner, intermediate, advanced)
- `features` (string): Filter by features (comma-separated)
- `limit` (number): Number of results to return (default: 100)
- `offset` (number): Number of results to skip (default: 0)
- `sort` (string): Sort field (name, rating, popularity, price)
- `order` (string): Sort order (asc, desc)

**Example Request:**
```bash
curl "http://localhost:3002/api/tools?search=chat&category=AI%20Assistant&limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ChatGPT Plus",
      "description": "Enhanced AI chatbot with advanced capabilities",
      "category": "AI Assistant",
      "subcategory": "Chatbots",
      "rating": 4.7,
      "price": "$20/month",
      "price_range": "paid",
      "features": ["GPT-4 access", "Plugins", "Advanced features"],
      "tags": ["AI", "chatbot", "productivity"],
      "image": "https://example.com/chatgpt.jpg",
      "affiliate_link": "https://chat.openai.com?ref=aionestop",
      "popularity": 95,
      "difficulty": "intermediate",
      "use_case": ["Content creation", "Customer support", "Research"],
      "agent_type": null,
      "capabilities": null,
      "integrations": null,
      "pricing_model": null,
      "status": "active",
      "created_at": "2024-08-14T04:00:00Z",
      "updated_at": "2024-08-14T04:00:00Z"
    }
  ],
  "count": 1
}
```

#### **POST /api/tools**
Add a new AI tool to the database.

**Request Body:**
```json
{
  "name": "New AI Tool",
  "description": "Description of the new tool",
  "category": "AI Assistant",
  "subcategory": "Chatbots",
  "rating": 4.5,
  "price": "$15/month",
  "price_range": "paid",
  "features": ["Feature 1", "Feature 2"],
  "tags": ["AI", "productivity"],
  "image": "https://example.com/tool.jpg",
  "affiliate_link": "https://tool.com?ref=aionestop",
  "popularity": 80,
  "difficulty": "intermediate",
  "use_case": ["Use case 1", "Use case 2"],
  "agent_type": "chatbot",
  "capabilities": ["Capability 1"],
  "integrations": ["Integration 1"],
  "pricing_model": "subscription"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3002/api/tools" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New AI Tool",
    "description": "Description of the new tool",
    "category": "AI Assistant",
    "subcategory": "Chatbots",
    "rating": 4.5,
    "price": "$15/month",
    "price_range": "paid",
    "features": ["Feature 1", "Feature 2"],
    "tags": ["AI", "productivity"],
    "image": "https://example.com/tool.jpg",
    "affiliate_link": "https://tool.com?ref=aionestop",
    "popularity": 80,
    "difficulty": "intermediate",
    "use_case": ["Use case 1", "Use case 2"]
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 50,
    "name": "New AI Tool",
    "description": "Description of the new tool",
    "category": "AI Assistant",
    "subcategory": "Chatbots",
    "rating": 4.5,
    "price": "$15/month",
    "price_range": "paid",
    "features": ["Feature 1", "Feature 2"],
    "tags": ["AI", "productivity"],
    "image": "https://example.com/tool.jpg",
    "affiliate_link": "https://tool.com?ref=aionestop",
    "popularity": 80,
    "difficulty": "intermediate",
    "use_case": ["Use case 1", "Use case 2"],
    "status": "active",
    "created_at": "2024-08-14T04:00:00Z",
    "updated_at": "2024-08-14T04:00:00Z"
  }
}
```

---

## 📊 **Categories API**

### **Base Endpoint:** `/api/categories`

#### **GET /api/categories**
Retrieve all tool categories with metadata.

**Example Request:**
```bash
curl "http://localhost:3002/api/categories"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "AI Assistant",
      "description": "AI-powered assistants and chatbots",
      "icon": "robot",
      "color": "#7B4DFF",
      "sort_order": 1,
      "created_at": "2024-08-14T04:00:00Z"
    },
    {
      "id": 2,
      "name": "Image Generation",
      "description": "AI tools for creating and editing images",
      "icon": "image",
      "color": "#FF6B2B",
      "sort_order": 2,
      "created_at": "2024-08-14T04:00:00Z"
    }
  ],
  "count": 2
}
```

---

## 👥 **Personas API**

### **Base Endpoint:** `/api/personas`

#### **GET /api/personas**
Retrieve all user personas with recommendations.

**Example Request:**
```bash
curl "http://localhost:3002/api/personas"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tech-Savvy Sarah",
      "description": "AI Innovation Seeker",
      "primary_interest": "Latest AI innovations",
      "shopping_behavior": "Researches thoroughly",
      "key_needs": ["Advanced functionality", "Integration capabilities"],
      "budget": "high",
      "pain_points": ["Tools becoming outdated quickly"],
      "recommended_tools": ["Claude AI", "GitHub Copilot", "Hugging Face"],
      "icon": "rocket",
      "color": "#7B4DFF",
      "created_at": "2024-08-14T04:00:00Z"
    }
  ],
  "count": 1
}
```

---

## 👁️ **Visitors API**

### **Base Endpoint:** `/api/visitors`

#### **GET /api/visitors**
Retrieve visitor data with optional filtering.

**Query Parameters:**
- `session_id` (string): Filter by session ID
- `limit` (number): Number of results to return (default: 100)
- `offset` (number): Number of results to skip (default: 0)

**Example Request:**
```bash
curl "http://localhost:3002/api/visitors?limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "session_id": "session_1234567890_abc123",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "referrer": "https://google.com",
      "landing_page": "/",
      "utm_source": "google",
      "utm_medium": "organic",
      "utm_campaign": null,
      "utm_term": null,
      "utm_content": null,
      "country": "US",
      "city": "San Francisco",
      "region": "CA",
      "timezone": "America/Los_Angeles",
      "device_type": "desktop",
      "browser": "Chrome",
      "os": "macOS",
      "screen_resolution": "1920x1080",
      "language": "en-US",
      "first_visit_at": "2024-08-14T04:00:00Z",
      "last_visit_at": "2024-08-14T04:00:00Z",
      "visit_count": 1,
      "total_time_on_site": 300,
      "pages_viewed": 5,
      "is_bounce": false,
      "conversion_goal": null,
      "conversion_value": null,
      "created_at": "2024-08-14T04:00:00Z",
      "updated_at": "2024-08-14T04:00:00Z"
    }
  ],
  "count": 1
}
```

#### **POST /api/visitors**
Track a new visitor or update existing visitor data.

**Request Body:**
```json
{
  "session_id": "session_1234567890_abc123",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "referrer": "https://google.com",
  "landing_page": "/",
  "utm_source": "google",
  "utm_medium": "organic",
  "utm_campaign": "brand",
  "utm_term": "ai tools",
  "utm_content": "banner",
  "country": "US",
  "city": "San Francisco",
  "region": "CA",
  "timezone": "America/Los_Angeles",
  "device_type": "desktop",
  "browser": "Chrome",
  "os": "macOS",
  "screen_resolution": "1920x1080",
  "language": "en-US"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3002/api/visitors" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_1234567890_abc123",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "landing_page": "/",
    "utm_source": "google",
    "device_type": "desktop",
    "browser": "Chrome",
    "os": "macOS"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "session_id": "session_1234567890_abc123",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "landing_page": "/",
    "utm_source": "google",
    "device_type": "desktop",
    "browser": "Chrome",
    "os": "macOS",
    "first_visit_at": "2024-08-14T04:00:00Z",
    "last_visit_at": "2024-08-14T04:00:00Z",
    "visit_count": 1,
    "pages_viewed": 1,
    "is_bounce": true,
    "created_at": "2024-08-14T04:00:00Z",
    "updated_at": "2024-08-14T04:00:00Z"
  },
  "isNewVisitor": true
}
```

---

## 📧 **Subscribers API**

### **Base Endpoint:** `/api/subscribers`

#### **GET /api/subscribers**
Retrieve subscriber data with optional filtering.

**Query Parameters:**
- `email` (string): Filter by email address
- `status` (string): Filter by subscription status (active, unsubscribed)
- `persona` (string): Filter by persona
- `limit` (number): Number of results to return (default: 100)
- `offset` (number): Number of results to skip (default: 0)

**Example Request:**
```bash
curl "http://localhost:3002/api/subscribers?status=active&limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "company": "Tech Corp",
      "job_title": "Developer",
      "industry": "Technology",
      "interests": ["AI tools", "automation"],
      "persona": "Tech-Savvy Sarah",
      "budget_range": "high",
      "use_case": ["Content creation", "Automation"],
      "source": "website",
      "utm_source": "google",
      "utm_medium": "organic",
      "utm_campaign": "newsletter",
      "utm_term": null,
      "utm_content": null,
      "ip_address": "192.168.1.1",
      "country": "US",
      "city": "San Francisco",
      "region": "CA",
      "timezone": "America/Los_Angeles",
      "device_type": "desktop",
      "browser": "Chrome",
      "os": "macOS",
      "language": "en-US",
      "subscription_status": "active",
      "email_verified": true,
      "verification_token": null,
      "verification_expires_at": null,
      "unsubscribe_token": "abc123def456",
      "last_email_sent_at": "2024-08-14T04:00:00Z",
      "email_open_count": 5,
      "email_click_count": 2,
      "total_emails_sent": 10,
      "preferences": {
        "frequency": "weekly",
        "categories": ["AI tools", "automation"]
      },
      "tags": ["early-adopter", "high-value"],
      "notes": "Interested in enterprise solutions",
      "created_at": "2024-08-14T04:00:00Z",
      "updated_at": "2024-08-14T04:00:00Z"
    }
  ],
  "count": 1
}
```

#### **POST /api/subscribers**
Add a new subscriber or update existing subscriber data.

**Request Body:**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "company": "Tech Corp",
  "job_title": "Developer",
  "industry": "Technology",
  "interests": ["AI tools", "automation"],
  "persona": "Tech-Savvy Sarah",
  "budget_range": "high",
  "use_case": ["Content creation", "Automation"],
  "source": "website",
  "utm_source": "google",
  "utm_medium": "organic",
  "utm_campaign": "newsletter",
  "utm_term": "ai tools",
  "utm_content": "banner",
  "ip_address": "192.168.1.1",
  "country": "US",
  "city": "San Francisco",
  "region": "CA",
  "timezone": "America/Los_Angeles",
  "device_type": "desktop",
  "browser": "Chrome",
  "os": "macOS",
  "language": "en-US"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3002/api/subscribers" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "first_name": "John",
    "persona": "Tech-Savvy Sarah",
    "interests": ["AI tools", "automation"],
    "source": "website"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "persona": "Tech-Savvy Sarah",
    "interests": ["AI tools", "automation"],
    "subscription_status": "active",
    "email_verified": false,
    "verification_token": "abc123def456",
    "verification_expires_at": "2024-08-15T04:00:00Z",
    "unsubscribe_token": "def456ghi789",
    "created_at": "2024-08-14T04:00:00Z",
    "updated_at": "2024-08-14T04:00:00Z"
  },
  "isNewSubscriber": true,
  "message": "Subscriber created successfully"
}
```

#### **PUT /api/subscribers**
Verify email or unsubscribe from emails.

**Request Body:**
```json
{
  "email": "user@example.com",
  "action": "verify",
  "token": "abc123def456"
}
```

**Example Request (Email Verification):**
```bash
curl -X PUT "http://localhost:3002/api/subscribers" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "action": "verify",
    "token": "abc123def456"
  }'
```

**Example Request (Unsubscribe):**
```bash
curl -X PUT "http://localhost:3002/api/subscribers" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "action": "unsubscribe",
    "token": "def456ghi789"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "email_verified": true,
    "verification_token": null,
    "verification_expires_at": null,
    "updated_at": "2024-08-14T04:00:00Z"
  },
  "message": "Email verified successfully"
}
```

---

## 📈 **Events API**

### **Base Endpoint:** `/api/events`

#### **GET /api/events**
Retrieve event data with optional filtering.

**Query Parameters:**
- `session_id` (string): Filter by session ID
- `visitor_id` (number): Filter by visitor ID
- `event_type` (string): Filter by event type
- `page_url` (string): Filter by page URL
- `limit` (number): Number of results to return (default: 100)
- `offset` (number): Number of results to skip (default: 0)

**Example Request:**
```bash
curl "http://localhost:3002/api/events?event_type=tool_interaction&limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "session_id": "session_1234567890_abc123",
      "visitor_id": 1,
      "event_type": "tool_interaction",
      "event_name": "Tool Click",
      "page_url": "https://aionestop.shop/tools",
      "page_title": "AI Tools Directory",
      "element_id": "chatgpt-card",
      "element_class": "tool-card",
      "element_text": "Learn More",
      "custom_data": {
        "tool_name": "ChatGPT Plus",
        "category": "AI Assistant",
        "price": "$20/month",
        "rating": 4.7,
        "source": "featured_tools"
      },
      "timestamp": "2024-08-14T04:00:00Z",
      "created_at": "2024-08-14T04:00:00Z"
    }
  ],
  "count": 1
}
```

#### **POST /api/events**
Track a new event.

**Request Body:**
```json
{
  "session_id": "session_1234567890_abc123",
  "visitor_id": 1,
  "event_type": "tool_interaction",
  "event_name": "Tool Click",
  "page_url": "https://aionestop.shop/tools",
  "page_title": "AI Tools Directory",
  "element_id": "chatgpt-card",
  "element_class": "tool-card",
  "element_text": "Learn More",
  "custom_data": {
    "tool_name": "ChatGPT Plus",
    "category": "AI Assistant",
    "price": "$20/month",
    "rating": 4.7,
    "source": "featured_tools"
  }
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3002/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_1234567890_abc123",
    "event_type": "tool_interaction",
    "event_name": "Tool Click",
    "element_id": "chatgpt-card",
    "custom_data": {
      "tool_name": "ChatGPT Plus",
      "category": "AI Assistant",
      "price": "$20/month"
    }
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "session_id": "session_1234567890_abc123",
    "visitor_id": 1,
    "event_type": "tool_interaction",
    "event_name": "Tool Click",
    "page_url": "https://aionestop.shop/tools",
    "page_title": "AI Tools Directory",
    "element_id": "chatgpt-card",
    "element_class": "tool-card",
    "element_text": "Learn More",
    "custom_data": {
      "tool_name": "ChatGPT Plus",
      "category": "AI Assistant",
      "price": "$20/month",
      "rating": 4.7,
      "source": "featured_tools"
    },
    "timestamp": "2024-08-14T04:00:00Z",
    "created_at": "2024-08-14T04:00:00Z"
  },
  "message": "Event tracked successfully"
}
```

---

## 🔍 **Event Types Reference**

### **Standard Event Types**

#### **1. Page Views**
```json
{
  "event_type": "page_view",
  "event_name": "Page View",
  "page_url": "https://aionestop.shop/tools",
  "page_title": "AI Tools Directory"
}
```

#### **2. Tool Interactions**
```json
{
  "event_type": "tool_interaction",
  "event_name": "Tool Click",
  "element_id": "chatgpt-card",
  "custom_data": {
    "tool_name": "ChatGPT Plus",
    "category": "AI Assistant",
    "price": "$20/month",
    "rating": 4.7,
    "source": "featured_tools"
  }
}
```

#### **3. Budget Builder Events**
```json
{
  "event_type": "budget_builder",
  "event_name": "Add Tool to Budget",
  "element_id": "budget-builder",
  "custom_data": {
    "tool_name": "Claude AI",
    "tool_category": "AI Assistant",
    "tool_price": "$20/month",
    "budget_tier": "AI Innovator",
    "tier_budget": 150,
    "current_total": 120,
    "tools_count": 3
  }
}
```

#### **4. Persona Selection**
```json
{
  "event_type": "persona_selection",
  "event_name": "Persona Selected",
  "element_id": "Tech-Savvy Sarah",
  "custom_data": {
    "persona_name": "Tech-Savvy Sarah",
    "persona_title": "AI Innovation Seeker",
    "persona_budget": "Medium to high - willing to invest in quality",
    "persona_interests": ["Latest AI innovations", "Advanced functionality"],
    "recommended_tools": ["Claude AI", "GitHub Copilot", "Hugging Face", "AutoGPT"]
  }
}
```

#### **5. Newsletter Subscription**
```json
{
  "event_type": "subscription",
  "event_name": "Newsletter Subscription",
  "element_id": "newsletter_signup",
  "custom_data": {
    "email": "user@example.com",
    "persona": "Tech-Savvy Sarah",
    "budget_range": "high",
    "is_new_subscriber": true
  }
}
```

#### **6. Form Submissions**
```json
{
  "event_type": "form_submit",
  "event_name": "Form Submission",
  "element_id": "contact_form",
  "custom_data": {
    "form_name": "Contact Form",
    "fields_completed": ["name", "email", "message"],
    "submission_time": "2024-08-14T04:00:00Z"
  }
}
```

---

## 🛠️ **Utility APIs**

### **Health Check**
**Endpoint:** `GET /api/health`

**Purpose:** Check API health and database connectivity.

**Example Request:**
```bash
curl "http://localhost:3002/api/health"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-08-14T04:00:00Z",
    "database": "connected",
    "version": "1.0.0"
  }
}
```

---

## 📊 **Analytics Queries**

### **Popular Tools Query**
```sql
SELECT 
  custom_data->>'tool_name' as tool_name,
  COUNT(*) as interactions
FROM visitor_events 
WHERE event_type = 'tool_interaction'
GROUP BY tool_name 
ORDER BY interactions DESC
LIMIT 10;
```

### **Budget Builder Usage Query**
```sql
SELECT 
  custom_data->>'budget_tier' as tier,
  COUNT(*) as selections
FROM visitor_events 
WHERE event_type = 'budget_builder' 
AND event_name = 'Select Budget Tier'
GROUP BY tier 
ORDER BY selections DESC;
```

### **Persona Analytics Query**
```sql
SELECT 
  custom_data->>'persona_name' as persona,
  COUNT(*) as selections
FROM visitor_events 
WHERE event_type = 'persona_selection'
GROUP BY persona 
ORDER BY selections DESC;
```

### **Conversion Funnel Query**
```sql
SELECT 
  v.landing_page,
  COUNT(DISTINCT v.session_id) as visitors,
  COUNT(DISTINCT CASE WHEN ve.event_type = 'tool_interaction' THEN v.session_id END) as tool_clicks,
  COUNT(DISTINCT CASE WHEN ve.event_type = 'subscription' THEN v.session_id END) as subscriptions
FROM visitors v
LEFT JOIN visitor_events ve ON v.session_id = ve.session_id
GROUP BY v.landing_page
ORDER BY visitors DESC;
```

---

## 🔧 **Rate Limiting**

### **Current Limits**
- **GET requests**: 1000 requests per minute per IP
- **POST requests**: 100 requests per minute per IP
- **PUT requests**: 50 requests per minute per IP

### **Rate Limit Headers**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 🚀 **SDK Integration**

### **JavaScript SDK Example**
```javascript
// Initialize tracking
const trackEvent = async (eventData) => {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Track tool interaction
trackEvent({
  session_id: 'session_1234567890_abc123',
  event_type: 'tool_interaction',
  event_name: 'Tool Click',
  element_id: 'chatgpt-card',
  custom_data: {
    tool_name: 'ChatGPT Plus',
    category: 'AI Assistant',
    price: '$20/month'
  }
});
```

### **React Hook Integration**
```javascript
import { useVisitorTracking } from '@/hooks/useVisitorTracking';

function MyComponent() {
  const { trackToolInteraction } = useVisitorTracking();

  const handleToolClick = (tool) => {
    trackToolInteraction(tool.name, 'click', {
      category: tool.category,
      price: tool.price,
      rating: tool.rating
    });
  };

  return (
    <button onClick={() => handleToolClick(tool)}>
      Learn More
    </button>
  );
}
```

---

## 📝 **Error Codes**

### **Common Error Responses**

#### **400 Bad Request**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Required field 'email' is missing"
}
```

#### **404 Not Found**
```json
{
  "success": false,
  "error": "Resource not found",
  "message": "Tool with ID 999 not found"
}
```

#### **500 Internal Server Error**
```json
{
  "success": false,
  "error": "Database connection failed",
  "message": "Unable to connect to database"
}
```

---

## 🔐 **Security Considerations**

### **Data Protection**
- All sensitive data is encrypted at rest
- HTTPS is required for all API calls
- Personal data is anonymized after 90 days
- GDPR and CCPA compliance implemented

### **Input Validation**
- All inputs are sanitized and validated
- SQL injection protection via parameterized queries
- XSS protection through content security policies
- Rate limiting to prevent abuse

---

## 📞 **Support**

### **API Support**
- **Documentation**: This document
- **Examples**: Code examples in this guide
- **Testing**: Use the provided curl examples
- **Issues**: Check the GitHub repository

### **Contact Information**
- **Email**: api-support@aionestop.shop
- **Documentation**: https://docs.aionestop.shop
- **Status Page**: https://status.aionestop.shop

---

**Document Version**: 1.0  
**Last Updated**: August 14, 2024  
**Next Review**: September 14, 2024  
**API Version**: v1
