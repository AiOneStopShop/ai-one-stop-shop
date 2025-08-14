const { FirecrawlApp } = require('firecrawl');

async function scrapeAIOneStopShop() {
  try {
    console.log('🚀 Starting Firecrawl scrape of aionestopshop.com...');
    
    const app = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY || 'your-api-key-here'
    });

    // Scrape the entire site with comprehensive settings
    const scrapeResult = await app.scrapeUrl('https://aionestopshop.com', {
      // Include all pages and subpages
      includeTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img', 'button', 'div', 'span'],
      excludeTags: ['script', 'style', 'nav', 'footer'],
      
      // Get all pages
      pageOptions: {
        onlyMainContent: false,
        includeHtml: true,
        includeMarkdown: true,
        includeImages: true,
        includeLinks: true,
        includeMetadata: true
      },
      
      // Follow all links within the domain
      followLinks: true,
      followLinksOptions: {
        maxRequests: 50,
        maxDepth: 5,
        sameDomain: true,
        includeQueryParams: false
      },
      
      // Extract structured data
      extractMetadata: true,
      extractOpenGraph: true,
      extractTwitterCards: true,
      
      // Wait for dynamic content
      waitFor: 3000,
      
      // Handle JavaScript
      javascript: true,
      waitForSelector: 'body'
    });

    console.log('✅ Scraping completed successfully!');
    console.log(`📊 Found ${scrapeResult.pages.length} pages`);
    
    return scrapeResult;
    
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    throw error;
  }
}

async function generateSummary(scrapeResult) {
  console.log('📝 Generating comprehensive summary...');
  
  let summary = `# AI One Stop Shop - Website Analysis
**Generated on:** ${new Date().toISOString()}
**Total Pages Scraped:** ${scrapeResult.pages.length}

---

## 📋 **Executive Summary**

This document provides a comprehensive analysis of the AI One Stop Shop website (aionestopshop.com) based on automated scraping and content analysis.

---

## 🏗️ **Site Structure & Navigation**

### **Main Pages Found:**
`;

  // Analyze page structure
  const pages = scrapeResult.pages;
  const mainPages = pages.filter(page => page.url.split('/').length <= 3);
  const subPages = pages.filter(page => page.url.split('/').length > 3);

  summary += `\n**Primary Pages (${mainPages.length}):**\n`;
  mainPages.forEach(page => {
    const title = page.metadata?.title || page.url.split('/').pop() || 'Home';
    summary += `- **${title}** - \`${page.url}\`\n`;
  });

  summary += `\n**Sub-pages (${subPages.length}):**\n`;
  subPages.forEach(page => {
    const title = page.metadata?.title || page.url.split('/').pop() || 'Untitled';
    summary += `- **${title}** - \`${page.url}\`\n`;
  });

  // Analyze content structure
  summary += `\n---\n## 📄 **Content Analysis**\n\n`;

  // Extract key content from each page
  pages.forEach((page, index) => {
    const title = page.metadata?.title || `Page ${index + 1}`;
    const description = page.metadata?.description || 'No description available';
    const wordCount = page.markdown?.split(' ').length || 0;
    
    summary += `### **${title}**\n`;
    summary += `**URL:** \`${page.url}\`\n`;
    summary += `**Description:** ${description}\n`;
    summary += `**Word Count:** ${wordCount} words\n`;
    
    // Extract headings
    const headings = page.markdown?.match(/^#{1,6}\s+.+$/gm) || [];
    if (headings.length > 0) {
      summary += `**Main Sections:**\n`;
      headings.slice(0, 5).forEach(heading => {
        summary += `- ${heading.trim()}\n`;
      });
    }
    
    // Extract links
    const links = page.links || [];
    if (links.length > 0) {
      summary += `**Key Links (${links.length}):**\n`;
      links.slice(0, 10).forEach(link => {
        summary += `- [${link.text || link.url}](${link.url})\n`;
      });
    }
    
    summary += `\n`;
  });

  // Analyze overall content themes
  summary += `---\n## 🎯 **Content Themes & Keywords**\n\n`;
  
  const allText = pages.map(page => page.markdown || '').join(' ');
  const words = allText.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const topWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20);
  
  summary += `**Most Frequent Keywords:**\n`;
  topWords.forEach(([word, count]) => {
    summary += `- **${word}** (${count} occurrences)\n`;
  });

  // Analyze images and media
  summary += `\n---\n## 🖼️ **Media & Assets**\n\n`;
  
  const allImages = pages.flatMap(page => page.images || []);
  summary += `**Total Images Found:** ${allImages.length}\n`;
  
  if (allImages.length > 0) {
    summary += `**Sample Images:**\n`;
    allImages.slice(0, 10).forEach(img => {
      summary += `- ${img.alt || 'No alt text'} - \`${img.src}\`\n`;
    });
  }

  // Technical analysis
  summary += `\n---\n## 🔧 **Technical Analysis**\n\n`;
  
  summary += `**Meta Tags Analysis:**\n`;
  pages.forEach(page => {
    if (page.metadata) {
      summary += `- **${page.url}**:\n`;
      summary += `  - Title: ${page.metadata.title || 'N/A'}\n`;
      summary += `  - Description: ${page.metadata.description || 'N/A'}\n`;
      summary += `  - Keywords: ${page.metadata.keywords || 'N/A'}\n`;
    }
  });

  // SEO analysis
  summary += `\n**SEO Analysis:**\n`;
  pages.forEach(page => {
    const hasTitle = page.metadata?.title ? '✅' : '❌';
    const hasDescription = page.metadata?.description ? '✅' : '❌';
    const hasKeywords = page.metadata?.keywords ? '✅' : '❌';
    
    summary += `- **${page.url}**: Title ${hasTitle} | Description ${hasDescription} | Keywords ${hasKeywords}\n`;
  });

  // Performance insights
  summary += `\n---\n## 📊 **Performance Insights**\n\n`;
  
  summary += `**Content Distribution:**\n`;
  summary += `- Total Pages: ${pages.length}\n`;
  summary += `- Average Word Count: ${Math.round(pages.reduce((sum, page) => sum + (page.markdown?.split(' ').length || 0), 0) / pages.length)}\n`;
  summary += `- Total Images: ${allImages.length}\n`;
  summary += `- Total Links: ${pages.reduce((sum, page) => sum + (page.links?.length || 0), 0)}\n`;

  // Recommendations
  summary += `\n---\n## 💡 **Recommendations**\n\n`;
  
  summary += `### **Content Optimization:**\n`;
  summary += `- Ensure all pages have unique, descriptive titles\n`;
  summary += `- Add meta descriptions to pages that are missing them\n`;
  summary += `- Optimize image alt text for better accessibility\n`;
  summary += `- Consider adding structured data markup\n\n`;
  
  summary += `### **Technical Improvements:**\n`;
  summary += `- Implement proper heading hierarchy (H1 → H2 → H3)\n`;
  summary += `- Add Open Graph and Twitter Card meta tags\n`;
  summary += `- Optimize page load speeds\n`;
  summary += `- Ensure mobile responsiveness\n\n`;
  
  summary += `### **User Experience:**\n`;
  summary += `- Improve navigation structure\n`;
  summary += `- Add breadcrumbs for better user orientation\n`;
  summary += `- Implement search functionality\n`;
  summary += `- Add call-to-action buttons where appropriate\n`;

  summary += `\n---\n## 📈 **Competitive Analysis**\n\n`;
  
  summary += `**Strengths:**\n`;
  summary += `- Comprehensive AI tool directory\n`;
  summary += `- User persona-based recommendations\n`;
  summary += `- Budget builder functionality\n`;
  summary += `- Real-time analytics tracking\n\n`;
  
  summary += `**Opportunities:**\n`;
  summary += `- Expand tool database\n`;
  summary += `- Add user reviews and ratings\n`;
  summary += `- Implement advanced search filters\n`;
  summary += `- Create educational content hub\n`;

  summary += `\n---\n**Analysis completed by:** Firecrawl Web Scraper\n**Date:** ${new Date().toISOString()}\n`;

  return summary;
}

async function main() {
  try {
    console.log('🎯 Starting AI One Stop Shop website analysis...\n');
    
    // Step 1: Scrape the website
    const scrapeResult = await scrapeAIOneStopShop();
    
    // Step 2: Generate comprehensive summary
    const summary = await generateSummary(scrapeResult);
    
    // Step 3: Save to file
    const fs = require('fs');
    const filename = `AI_One_Stop_Shop_Analysis_${new Date().toISOString().split('T')[0]}.md`;
    
    fs.writeFileSync(filename, summary);
    
    console.log(`\n✅ Analysis complete!`);
    console.log(`📄 Summary saved to: ${filename}`);
    console.log(`📊 Pages analyzed: ${scrapeResult.pages.length}`);
    console.log(`📝 Summary length: ${summary.length} characters`);
    
    return { filename, summary, scrapeResult };
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapeAIOneStopShop, generateSummary, main };
