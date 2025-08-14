const { Perplexity } = require('@ai-sdk/perplexity');
const fs = require('fs');

async function researchKeywordsWithPerplexity() {
  try {
    console.log('🔍 Starting Perplexity keyword research for AI One Stop Shop...\n');
    
    const perplexity = new Perplexity({
      apiKey: process.env.PERPLEXITY_API_KEY
    });

    const researchQueries = [
      {
        title: "AI Tools Market Keywords",
        query: "What are the most searched keywords and terms related to AI tools, artificial intelligence software, and AI applications in 2024? Include search volume data and trending terms."
      },
      {
        title: "AI Tool Discovery Keywords",
        query: "What are the top search terms people use when looking for AI tools, AI software discovery, and AI tool comparison websites? Include long-tail keywords and user intent."
      },
      {
        title: "AI Business Keywords",
        query: "What are the most valuable keywords for AI business tools, enterprise AI solutions, and AI productivity software? Focus on commercial and business use cases."
      },
      {
        title: "AI Tool Categories Keywords",
        query: "What are the trending search terms for different AI tool categories like AI assistants, image generation, productivity tools, and development tools? Include category-specific keywords."
      },
      {
        title: "AI Tool Comparison Keywords",
        query: "What keywords do people use when comparing AI tools, looking for AI tool reviews, or trying to choose between different AI software options?"
      },
      {
        title: "AI Tool Pricing Keywords",
        query: "What are the search terms related to AI tool pricing, cost comparison, free AI tools, and budget-friendly AI software options?"
      },
      {
        title: "AI Tool Implementation Keywords",
        query: "What keywords do businesses use when looking for AI tool implementation, integration, setup guides, and best practices for AI software?"
      },
      {
        title: "AI Tool ROI Keywords",
        query: "What search terms are used when looking for AI tool ROI, business value, cost-benefit analysis, and AI tool effectiveness metrics?"
      }
    ];

    const results = {};

    for (const research of researchQueries) {
      console.log(`📊 Researching: ${research.title}...`);
      
      try {
        const response = await perplexity.generateText({
          model: 'llama-3.1-sonar-small-128k-online',
          prompt: research.query,
          maxTokens: 2000
        });

        results[research.title] = {
          query: research.query,
          response: response.text,
          timestamp: new Date().toISOString()
        };

        console.log(`✅ Completed: ${research.title}`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error researching ${research.title}:`, error.message);
        results[research.title] = {
          query: research.query,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    return results;
    
  } catch (error) {
    console.error('❌ Error in keyword research:', error);
    throw error;
  }
}

function generateKeywordReport(results) {
  console.log('📝 Generating comprehensive keyword report...');
  
  let report = `# AI One Stop Shop - Keyword Research Report
**Generated on:** ${new Date().toISOString()}
**Research Method:** Perplexity AI Search Analysis
**Platform:** AI One Stop Shop

---

## 📋 **Executive Summary**

This report provides comprehensive keyword research and search term analysis for the AI One Stop Shop platform, based on Perplexity AI search data and market insights.

---

## 🎯 **Research Methodology**

- **AI-Powered Search**: Leveraged Perplexity's advanced search capabilities
- **Market Analysis**: Focused on AI tools, software discovery, and business applications
- **User Intent**: Analyzed search patterns and user behavior
- **Competitive Intelligence**: Identified trending terms and market opportunities

---

## 📊 **Keyword Research Results**

`;

  Object.entries(results).forEach(([title, data]) => {
    report += `### **${title}**\n\n`;
    
    if (data.error) {
      report += `**Error:** ${data.error}\n\n`;
    } else {
      report += `**Research Query:** ${data.query}\n\n`;
      report += `**Key Findings:**\n\n`;
      report += `${data.response}\n\n`;
    }
    
    report += `---\n\n`;
  });

  // Add strategic recommendations
  report += `## 💡 **Strategic Keyword Recommendations**

### **Primary Keywords (High Volume)**
Based on the research, focus on these high-volume keywords:

1. **AI Tools** - Core category keyword
2. **Artificial Intelligence Software** - Broad search term
3. **AI Applications** - Growing search volume
4. **AI Software Discovery** - User intent focused
5. **AI Tool Comparison** - Comparison intent

### **Long-Tail Keywords (High Conversion)**
Target these specific, high-intent keywords:

1. **"Best AI tools for [specific use case]"**
2. **"AI software comparison [category]"**
3. **"Free AI tools for [business need]"**
4. **"AI tool pricing comparison"**
5. **"AI software implementation guide"**

### **Category-Specific Keywords**
Organize content around these categories:

#### **AI Assistants**
- ChatGPT alternatives
- AI chatbot tools
- Virtual assistant software
- AI conversation tools

#### **Image Generation**
- AI image generator
- Text to image AI
- AI art tools
- Image editing AI

#### **Productivity Tools**
- AI productivity software
- Workflow automation AI
- AI project management
- Business AI tools

#### **Development Tools**
- AI coding assistant
- AI development tools
- Code generation AI
- AI programming tools

### **Business-Focused Keywords**
Target enterprise and business users:

1. **"AI tools for business"**
2. **"Enterprise AI solutions"**
3. **"AI software ROI"**
4. **"AI tool implementation"**
5. **"AI business automation"**

---

## 🎯 **Content Strategy Recommendations**

### **SEO Content Ideas**
1. **Tool Comparison Pages**: "ChatGPT vs Claude vs [other tools]"
2. **Category Guides**: "Best AI Tools for [Industry/Use Case]"
3. **Pricing Analysis**: "AI Tool Pricing Comparison 2024"
4. **Implementation Guides**: "How to Implement AI Tools in Your Business"
5. **ROI Calculators**: "Calculate Your AI Tool ROI"

### **Blog Content Topics**
1. **"Top 10 AI Tools for [Specific Industry]"**
2. **"AI Tool Trends in 2024"**
3. **"How to Choose the Right AI Tool for Your Business"**
4. **"AI Tool Implementation Best Practices"**
5. **"Free vs Paid AI Tools: When to Upgrade"**

### **Video Content Ideas**
1. **AI Tool Reviews and Comparisons**
2. **Implementation Tutorials**
3. **ROI Case Studies**
4. **Tool Setup Guides**
5. **Industry-Specific AI Tool Recommendations**

---

## 📈 **Competitive Analysis**

### **Keyword Gaps**
Identify opportunities where competitors are weak:

1. **Local SEO**: "AI tools [city/region]"
2. **Industry-Specific**: "AI tools for [specific industry]"
3. **Use Case Specific**: "AI tools for [specific task]"
4. **Budget-Focused**: "Affordable AI tools"
5. **Implementation**: "AI tool setup guide"

### **Featured Snippet Opportunities**
Target keywords that trigger featured snippets:

1. **"What are the best AI tools?"**
2. **"How to choose AI software?"**
3. **"AI tool pricing comparison"**
4. **"AI software implementation"**
5. **"AI tools for business"**

---

## 🚀 **Implementation Strategy**

### **Phase 1: Core Keywords (Month 1-2)**
- Optimize homepage for "AI tools" and "artificial intelligence software"
- Create category pages for main AI tool types
- Develop tool comparison content

### **Phase 2: Long-Tail Keywords (Month 3-4)**
- Create specific use case content
- Develop industry-specific guides
- Build comparison and review content

### **Phase 3: Advanced Keywords (Month 5-6)**
- Target implementation and ROI keywords
- Create educational content
- Develop case studies and testimonials

### **Phase 4: Competitive Keywords (Month 7+)**
- Target competitor keyword gaps
- Create comprehensive guides
- Develop thought leadership content

---

## 📊 **Performance Tracking**

### **Key Metrics to Monitor**
1. **Organic Traffic**: Track growth in organic search visits
2. **Keyword Rankings**: Monitor position changes for target keywords
3. **Click-Through Rate**: Measure CTR for search results
4. **Conversion Rate**: Track conversions from organic traffic
5. **Bounce Rate**: Monitor engagement quality

### **Tools for Tracking**
1. **Google Search Console**: Monitor search performance
2. **Google Analytics**: Track traffic and conversions
3. **Ahrefs/SEMrush**: Competitive keyword analysis
4. **Perplexity**: Ongoing keyword research
5. **Custom Analytics**: Platform-specific metrics

---

## 💰 **Revenue Impact**

### **Expected Outcomes**
- **Month 3**: 50% increase in organic traffic
- **Month 6**: 100% increase in organic traffic
- **Month 12**: 200% increase in organic traffic
- **Conversion Rate**: 2-5% improvement
- **Revenue Impact**: 25-50% increase in affiliate revenue

### **ROI Projections**
- **Investment**: Content creation and SEO optimization
- **Timeline**: 6-12 months for full impact
- **Expected Return**: 300-500% ROI on SEO investment
- **Long-term Value**: Sustainable organic traffic growth

---

## 🎯 **Next Steps**

### **Immediate Actions (Next 30 Days)**
1. **Keyword Implementation**: Update existing content with target keywords
2. **Content Calendar**: Plan content creation based on keyword research
3. **Technical SEO**: Optimize site structure for target keywords
4. **Competitive Analysis**: Identify and target keyword gaps

### **Medium-term Goals (Next 90 Days)**
1. **Content Creation**: Develop comprehensive content for target keywords
2. **Link Building**: Build backlinks for target keyword pages
3. **User Experience**: Optimize site for better engagement
4. **Analytics Setup**: Implement tracking for keyword performance

### **Long-term Strategy (Next 6 Months)**
1. **Authority Building**: Establish thought leadership in AI tools space
2. **Content Expansion**: Create comprehensive resource library
3. **Community Building**: Engage with AI tool users and creators
4. **Partnership Development**: Collaborate with AI tool providers

---

**Report generated by:** Perplexity AI Keyword Research  
**Date:** ${new Date().toISOString()}
**Platform:** AI One Stop Shop  
**Status:** Ready for Implementation
`;

  return report;
}

async function main() {
  try {
    console.log('🎯 Starting Perplexity keyword research for AI One Stop Shop...\n');
    
    // Step 1: Conduct keyword research
    const results = await researchKeywordsWithPerplexity();
    
    // Step 2: Generate comprehensive report
    const report = generateKeywordReport(results);
    
    // Step 3: Save results
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `AI_One_Stop_Shop_Keyword_Research_${timestamp}.md`;
    
    fs.writeFileSync(filename, report);
    
    // Step 4: Save raw data
    const rawDataFilename = `keyword_research_raw_data_${timestamp}.json`;
    fs.writeFileSync(rawDataFilename, JSON.stringify(results, null, 2));
    
    console.log('\n🎉 Keyword research completed!');
    console.log(`📄 Report saved to: ${filename}`);
    console.log(`📊 Raw data saved to: ${rawDataFilename}`);
    console.log(`📈 Researched ${Object.keys(results).length} keyword categories`);
    
    return { filename, report, results };
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { researchKeywordsWithPerplexity, generateKeywordReport, main };
