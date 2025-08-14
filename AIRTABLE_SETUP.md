# 🗄️ Airtable Integration Setup Guide

This guide will help you set up Airtable as your content management system for AI One Stop Shop.

## 📋 **Prerequisites**

1. **Airtable Account**: Sign up at [airtable.com](https://airtable.com)
2. **API Key**: Get your API key from Airtable account settings
3. **Base ID**: Create a new base or use existing one

## 🚀 **Step 1: Create Your Airtable Base**

### **Base Structure**
Create the following tables in your Airtable base:

#### **1. AI Tools Table**
| Field Name | Type | Description |
|------------|------|-------------|
| Name | Single line text | Tool name |
| Description | Long text | Tool description |
| Category | Multiple select | AI Assistant, Image Generation, etc. |
| Subcategory | Multiple select | Chatbot, Art, Design, etc. |
| Rating | Number | 0-5 rating |
| Price | Single line text | $20/month, Free, etc. |
| PriceRange | Single select | free, freemium, paid, enterprise |
| Features | Multiple select | Advanced reasoning, File analysis, etc. |
| Tags | Multiple select | claude, anthropic, reasoning, etc. |
| Image | URL | Tool image URL |
| AffiliateLink | URL | Affiliate link |
| Popularity | Number | 0-100 popularity score |
| Difficulty | Single select | beginner, intermediate, advanced |
| UseCase | Multiple select | Research, Writing, Analysis, etc. |
| AgentType | Single line text | Autonomous, Personal, etc. |
| Capabilities | Multiple select | Text processing, File analysis, etc. |
| Integrations | Multiple select | API, Web interface, Mobile app, etc. |
| PricingModel | Single line text | Subscription, One-time, etc. |
| Status | Single select | active, inactive, coming_soon |
| LastUpdated | Date | Last update date |

#### **2. AI Agents Table**
| Field Name | Type | Description |
|------------|------|-------------|
| Name | Single line text | Agent name |
| Description | Long text | Agent description |
| Category | Multiple select | Reasoning Agent, Autonomous Agent, etc. |
| Subcategory | Multiple select | Analysis, Task Automation, etc. |
| Rating | Number | 0-5 rating |
| Price | Single line text | $20/month, Free, etc. |
| PriceRange | Single select | free, freemium, paid, enterprise |
| Features | Multiple select | Advanced reasoning, File analysis, etc. |
| Tags | Multiple select | claude, anthropic, reasoning, etc. |
| Image | URL | Agent image URL |
| AffiliateLink | URL | Affiliate link |
| Popularity | Number | 0-100 popularity score |
| Difficulty | Single select | beginner, intermediate, advanced |
| UseCase | Multiple select | Research, Analysis, Problem-solving, etc. |
| AgentType | Single line text | Autonomous, Personal, etc. |
| Capabilities | Multiple select | Text processing, File analysis, etc. |
| Integrations | Multiple select | API, Web interface, Mobile app, etc. |
| PricingModel | Single line text | Subscription, One-time, etc. |
| Status | Single select | active, inactive, coming_soon |
| LastUpdated | Date | Last update date |

#### **3. Categories Table**
| Field Name | Type | Description |
|------------|------|-------------|
| Name | Single line text | Category name |
| Description | Long text | Category description |
| Icon | Single line text | Category icon name |
| Color | Single line text | Category color |
| SortOrder | Number | Display order |

#### **4. User Personas Table**
| Field Name | Type | Description |
|------------|------|-------------|
| Name | Single line text | Persona name |
| Description | Long text | Persona description |
| PrimaryInterest | Long text | Primary interests |
| ShoppingBehavior | Long text | Shopping behavior |
| KeyNeeds | Multiple select | Key needs |
| Budget | Single select | Limited, Medium, High |
| PainPoints | Multiple select | Pain points |
| RecommendedTools | Multiple select | Recommended tool IDs |
| Icon | Single line text | Persona icon |
| Color | Single line text | Persona color |

#### **5. Budget Tiers Table**
| Field Name | Type | Description |
|------------|------|-------------|
| Name | Single line text | Tier name |
| Subtitle | Single line text | Tier subtitle |
| Budget | Number | Budget amount |
| Description | Long text | Tier description |
| Features | Multiple select | Tier features |
| RecommendedTools | Multiple select | Recommended tool IDs |
| MaxTools | Number | Maximum tools allowed |
| Category | Single select | starter, growth, professional, enterprise |
| Icon | Single line text | Tier icon |
| Color | Single line text | Tier color |
| BgGradient | Single line text | Background gradient |

#### **6. Featured Tools Table**
| Field Name | Type | Description |
|------------|------|-------------|
| ToolID | Single line text | Reference to tool |
| FeaturedOrder | Number | Display order |
| FeaturedUntil | Date | Featured until date |
| Notes | Long text | Featured notes |

#### **7. Testimonials Table**
| Field Name | Type | Description |
|------------|------|-------------|
| Name | Single line text | Customer name |
| Role | Single line text | Customer role |
| Company | Single line text | Company name |
| Content | Long text | Testimonial content |
| Rating | Number | 1-5 rating |
| Image | URL | Customer image |
| Status | Single select | active, inactive |

#### **8. Knowledge Articles Table**
| Field Name | Type | Description |
|------------|------|-------------|
| Title | Single line text | Article title |
| Content | Long text | Article content |
| Category | Single select | Tutorial, Guide, News, etc. |
| Tags | Multiple select | Article tags |
| Author | Single line text | Author name |
| PublishedDate | Date | Publication date |
| Status | Single select | draft, published, archived |
| Featured | Checkbox | Featured article |

## 🔑 **Step 2: Get Your API Credentials**

### **API Key**
1. Go to [airtable.com/account](https://airtable.com/account)
2. Click "Generate API key"
3. Copy the API key

### **Base ID**
1. Open your Airtable base
2. Go to Help → API Documentation
3. Copy the Base ID from the URL

## ⚙️ **Step 3: Configure Environment Variables**

Create a `.env.local` file in your project root:

```env
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=https://aionestop.shop

# Custom Key (if needed)
CUSTOM_KEY=your_custom_key_here
```

## 📊 **Step 4: Import Your Data**

### **Option 1: Manual Entry**
Add your AI tools manually through the Airtable interface.

### **Option 2: Import from CSV**
1. Export your current tools data to CSV
2. Import into Airtable using the import feature

### **Option 3: Use the API**
Use the provided API endpoints to add tools programmatically.

## 🔧 **Step 5: Test the Integration**

### **Test API Endpoints**
```bash
# Get all tools
curl http://localhost:3001/api/tools

# Get tools by category
curl http://localhost:3001/api/tools?category=AI%20Assistant

# Search tools
curl http://localhost:3001/api/tools?search=claude

# Get featured tools
curl http://localhost:3001/api/tools?featured=true

# Get categories
curl http://localhost:3001/api/categories

# Get personas
curl http://localhost:3001/api/personas
```

### **Test in Browser**
Visit your local development server and check the console for any errors.

## 📱 **Step 6: Update Components**

Your components are already set up to use Airtable data. The integration will automatically:

- ✅ Fetch tools from Airtable
- ✅ Filter by category, search, persona
- ✅ Display featured tools
- ✅ Show categories and personas
- ✅ Handle loading and error states

## 🚀 **Step 7: Deploy to Vercel**

### **Environment Variables in Vercel**
1. Go to your Vercel project settings
2. Add the environment variables:
   - `AIRTABLE_API_KEY`
   - `AIRTABLE_BASE_ID`
   - `NEXT_PUBLIC_SITE_URL`

### **Deploy**
```bash
git add .
git commit -m "Add Airtable integration"
git push origin main
```

## 📈 **Benefits of Airtable Integration**

### **🎯 Content Management**
- **Easy Updates**: Update tools without code changes
- **Rich Data**: Store complex data structures
- **Collaboration**: Multiple team members can edit
- **Version Control**: Track changes over time

### **🚀 Performance**
- **Caching**: API responses are cached
- **Filtering**: Server-side filtering and search
- **Pagination**: Handle large datasets efficiently
- **Real-time**: Updates reflect immediately

### **🔧 Flexibility**
- **Custom Fields**: Add new fields easily
- **Views**: Create different views for different purposes
- **Automation**: Set up automations for data updates
- **Integrations**: Connect with other tools

## 🛠️ **Advanced Features**

### **Automated Updates**
Set up Airtable automations to:
- Update tool prices automatically
- Add new tools from web scraping
- Sync with external APIs
- Send notifications for changes

### **Custom Views**
Create different views in Airtable for:
- Featured tools
- New additions
- Popular tools
- Tools by difficulty
- Tools by price range

### **Data Validation**
Use Airtable's validation features to:
- Ensure required fields are filled
- Validate URLs and emails
- Set rating ranges (0-5)
- Enforce category selections

## 🔍 **Troubleshooting**

### **Common Issues**

#### **API Key Issues**
```
Error: Invalid API key
```
**Solution**: Check your API key in environment variables

#### **Base ID Issues**
```
Error: Base not found
```
**Solution**: Verify your base ID is correct

#### **Permission Issues**
```
Error: Insufficient permissions
```
**Solution**: Check your Airtable account permissions

#### **Rate Limiting**
```
Error: Rate limit exceeded
```
**Solution**: Implement caching or reduce request frequency

### **Debug Mode**
Enable debug logging by adding to your environment:
```env
DEBUG=true
```

## 📞 **Support**

If you need help with Airtable integration:
1. Check the [Airtable API documentation](https://airtable.com/api)
2. Review the error logs in your browser console
3. Test API endpoints directly
4. Verify your environment variables

---

**🎉 Congratulations! Your AI One Stop Shop is now powered by Airtable!**
