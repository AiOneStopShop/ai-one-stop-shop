# 🗄️ Airtable Table Setup Guide

This guide will help you create the perfect AI Tools table in your Airtable base.

## 🚀 **Step 1: Create the AI Tools Table**

### **1. Go to Your Airtable Base**
- Visit: https://airtable.com/appv7IBZvNJ7Y3pmV
- Click **"Add a table"** or the **+** button
- Name it: **"AI Tools"**

## 📋 **Step 2: Add the Required Fields**

### **Field 1: Name**
- **Field Type:** Single line text
- **Field Name:** `Name`
- **Required:** Yes
- **Description:** Tool name (e.g., "Claude AI", "Midjourney")

### **Field 2: Description**
- **Field Type:** Long text
- **Field Name:** `Description`
- **Required:** Yes
- **Description:** Detailed tool description

### **Field 3: Category**
- **Field Type:** Multiple select
- **Field Name:** `Category`
- **Options:**
  - AI Assistant
  - Image Generation
  - Video Creation
  - Text & Writing
  - Code & Development
  - Audio & Music
  - Data & Analytics
  - Productivity

### **Field 4: Subcategory**
- **Field Type:** Multiple select
- **Field Name:** `Subcategory`
- **Options:**
  - Chatbot
  - Search
  - Personal
  - Art
  - Open Source
  - Design
  - Video Editing
  - Video Generation
  - Content Creation
  - Copywriting
  - Writing Assistant
  - Code Assistant
  - AI Models
  - IDE
  - Music Generation
  - Voice Generation
  - Data Visualization
  - Business Intelligence
  - Product Analytics
  - Data Extraction
  - Note-taking
  - Project Management

### **Field 5: Rating**
- **Field Type:** Number
- **Field Name:** `Rating`
- **Required:** No
- **Description:** Tool rating (0-5)
- **Validation:** Between 0 and 5

### **Field 6: Price**
- **Field Type:** Single line text
- **Field Name:** `Price`
- **Required:** No
- **Description:** Price display (e.g., "$20/month", "Free")

### **Field 7: PriceRange**
- **Field Type:** Single select
- **Field Name:** `PriceRange`
- **Options:**
  - free
  - freemium
  - paid
  - enterprise

### **Field 8: Features**
- **Field Type:** Multiple select
- **Field Name:** `Features`
- **Options:**
  - Advanced reasoning
  - File analysis
  - Code generation
  - Research
  - Writing
  - Image generation
  - Video creation
  - Audio processing
  - Data analysis
  - API access
  - Integration
  - Collaboration
  - Customization
  - Export options
  - Mobile app
  - Desktop app
  - Web interface

### **Field 9: Tags**
- **Field Type:** Multiple select
- **Field Name:** `Tags`
- **Options:**
  - claude
  - anthropic
  - reasoning
  - analysis
  - openai
  - gpt
  - midjourney
  - dalle
  - stable-diffusion
  - github
  - copilot
  - hugging-face
  - open-source
  - free
  - paid
  - enterprise
  - api
  - sdk
  - integration

### **Field 10: Image**
- **Field Type:** URL
- **Field Name:** `Image`
- **Required:** No
- **Description:** Tool image URL

### **Field 11: AffiliateLink**
- **Field Type:** URL
- **Field Name:** `AffiliateLink`
- **Required:** No
- **Description:** Your affiliate link

### **Field 12: Popularity**
- **Field Type:** Number
- **Field Name:** `Popularity`
- **Required:** No
- **Description:** Popularity score (0-100)
- **Validation:** Between 0 and 100

### **Field 13: Difficulty**
- **Field Type:** Single select
- **Field Name:** `Difficulty`
- **Options:**
  - beginner
  - intermediate
  - advanced

### **Field 14: UseCase**
- **Field Type:** Multiple select
- **Field Name:** `UseCase`
- **Options:**
  - Research
  - Writing
  - Analysis
  - Design
  - Development
  - Marketing
  - Education
  - Business
  - Personal
  - Creative
  - Productivity
  - Automation

### **Field 15: AgentType**
- **Field Type:** Single line text
- **Field Name:** `AgentType`
- **Required:** No
- **Description:** Type of AI agent (e.g., "Autonomous", "Personal")

### **Field 16: Capabilities**
- **Field Type:** Multiple select
- **Field Name:** `Capabilities`
- **Options:**
  - Text processing
  - File analysis
  - Code generation
  - Image generation
  - Video creation
  - Audio processing
  - Data analysis
  - Web scraping
  - API integration
  - Automation
  - Learning
  - Reasoning

### **Field 17: Integrations**
- **Field Type:** Multiple select
- **Field Name:** `Integrations`
- **Options:**
  - API
  - Web interface
  - Mobile app
  - Desktop app
  - Slack
  - Discord
  - Zapier
  - Notion
  - Google Workspace
  - Microsoft Office
  - GitHub
  - Figma
  - Canva

### **Field 18: PricingModel**
- **Field Type:** Single line text
- **Field Name:** `PricingModel`
- **Required:** No
- **Description:** Pricing model (e.g., "Subscription", "One-time")

### **Field 19: Status**
- **Field Type:** Single select
- **Field Name:** `Status`
- **Options:**
  - active
  - inactive
  - coming_soon

### **Field 20: LastUpdated**
- **Field Type:** Date
- **Field Name:** `LastUpdated`
- **Required:** No
- **Description:** Last update date

## 🎯 **Step 3: Field Order**

Arrange your fields in this order for best organization:

1. Name
2. Description
3. Category
4. Subcategory
5. Rating
6. Price
7. PriceRange
8. Features
9. Tags
10. Image
11. AffiliateLink
12. Popularity
13. Difficulty
14. UseCase
15. AgentType
16. Capabilities
17. Integrations
18. PricingModel
19. Status
20. LastUpdated

## ✅ **Step 4: Test Your Table**

Once you've created the table:

1. **Add a test record** with sample data
2. **Run the test script:**
   ```bash
   npm run test:airtable
   ```
3. **If successful, migrate your data:**
   ```bash
   npm run migrate:airtable
   ```

## 🚀 **Quick Setup Tips**

### **Copy-Paste Field Names**
Copy these exact field names to avoid typos:
```
Name, Description, Category, Subcategory, Rating, Price, PriceRange, Features, Tags, Image, AffiliateLink, Popularity, Difficulty, UseCase, AgentType, Capabilities, Integrations, PricingModel, Status, LastUpdated
```

### **Field Validation**
- **Rating:** Set min: 0, max: 5
- **Popularity:** Set min: 0, max: 100
- **PriceRange:** Use exact values: free, freemium, paid, enterprise
- **Difficulty:** Use exact values: beginner, intermediate, advanced
- **Status:** Use exact values: active, inactive, coming_soon

### **Multiple Select Options**
For multiple select fields, you can add more options later. Start with the ones listed above.

## 🎉 **You're Ready!**

Once your table is set up, your AI One Stop Shop will be fully connected to Airtable!

---

**Need help?** The migration script will automatically populate your table with all your existing AI tools data.
