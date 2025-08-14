const firecrawl = require('firecrawl');
const fs = require('fs');

async function scrapeWebsite(url, name) {
  try {
    console.log(`🚀 Starting Firecrawl scrape of ${name} (${url})...`);
    
    // Initialize Firecrawl with API key
    const app = new firecrawl.FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY
    });

    // Scrape with comprehensive settings
    const scrapeResult = await app.scrapeUrl(url, {
      // Include all important content
      includeTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img', 'button', 'div', 'span', 'section', 'article'],
      excludeTags: ['script', 'style', 'noscript'],
      
      // Get comprehensive page data
      pageOptions: {
        onlyMainContent: false,
        includeHtml: true,
        includeMarkdown: true,
        includeImages: true,
        includeLinks: true,
        includeMetadata: true
      },
      
      // Follow internal links
      followLinks: true,
      followLinksOptions: {
        maxRequests: 20,
        maxDepth: 2,
        sameDomain: true,
        includeQueryParams: false
      },
      
      // Extract all metadata
      extractMetadata: true,
      extractOpenGraph: true,
      extractTwitterCards: true,
      
      // Handle dynamic content
      waitFor: 2000,
      javascript: true,
      waitForSelector: 'body'
    });

    console.log(`✅ Scraping completed for ${name}!`);
    console.log(`📊 Found ${scrapeResult.pages.length} pages`);
    
    return scrapeResult;
    
  } catch (error) {
    console.error(`❌ Error scraping ${name}:`, error.message);
    return null;
  }
}

function generateComprehensiveSummary(scrapeResult, siteName) {
  console.log(`📝 Generating comprehensive summary for ${siteName}...`);
  
  if (!scrapeResult || !scrapeResult.pages || scrapeResult.pages.length === 0) {
    return `# ${siteName} - Analysis Failed\n\nUnable to scrape the website. Please check the URL and try again.`;
  }

  const pages = scrapeResult.pages;
  
  let summary = `# ${siteName} - Comprehensive Website Analysis
**Generated on:** ${new Date().toISOString()}
**Total Pages Scraped:** ${pages.length}
**Analysis Type:** Automated Web Scraping & Content Analysis

---

## 📋 **Executive Summary**

This document provides a comprehensive analysis of the ${siteName} website based on automated scraping and content analysis. The analysis covers site structure, content themes, technical implementation, and provides actionable recommendations.

---

## 🏗️ **Site Architecture & Navigation**

### **Page Structure Analysis:**
`;

  // Analyze page hierarchy
  const mainPages = pages.filter(page => {
    try {
      const pathParts = new URL(page.url).pathname.split('/').filter(Boolean);
      return pathParts.length <= 1;
    } catch (e) {
      return true; // Assume main page if URL parsing fails
    }
  });
  
  const subPages = pages.filter(page => {
    try {
      const pathParts = new URL(page.url).pathname.split('/').filter(Boolean);
      return pathParts.length > 1;
    } catch (e) {
      return false;
    }
  });

  summary += `**Primary Pages (${mainPages.length}):**\n`;
  mainPages.forEach(page => {
    const title = page.metadata?.title || page.url.split('/').pop() || 'Home';
    const description = page.metadata?.description || 'No description';
    summary += `- **${title}** - \`${page.url}\`\n`;
    summary += `  - Description: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\n`;
  });

  summary += `\n**Sub-pages (${subPages.length}):**\n`;
  subPages.forEach(page => {
    const title = page.metadata?.title || page.url.split('/').pop() || 'Untitled';
    summary += `- **${title}** - \`${page.url}\`\n`;
  });

  // Content analysis
  summary += `\n---\n## 📄 **Detailed Content Analysis**\n\n`;

  pages.forEach((page, index) => {
    const title = page.metadata?.title || `Page ${index + 1}`;
    const description = page.metadata?.description || 'No description available';
    const wordCount = page.markdown?.split(/\s+/).length || 0;
    const charCount = page.markdown?.length || 0;
    
    summary += `### **${title}**\n`;
    summary += `**URL:** \`${page.url}\`\n`;
    summary += `**Description:** ${description}\n`;
    summary += `**Content Stats:** ${wordCount} words, ${charCount} characters\n`;
    
    // Extract main headings
    const headings = page.markdown?.match(/^#{1,6}\s+.+$/gm) || [];
    if (headings.length > 0) {
      summary += `**Page Structure:**\n`;
      headings.slice(0, 8).forEach(heading => {
        const level = heading.match(/^(#{1,6})/)[1].length;
        const indent = '  '.repeat(level - 1);
        summary += `${indent}- ${heading.replace(/^#{1,6}\s+/, '')}\n`;
      });
    }
    
    // Extract key links
    const links = page.links || [];
    if (links.length > 0) {
      try {
        const hostname = new URL(page.url).hostname;
        const internalLinks = links.filter(link => link.url.includes(hostname));
        const externalLinks = links.filter(link => !link.url.includes(hostname));
        
        summary += `**Links:** ${internalLinks.length} internal, ${externalLinks.length} external\n`;
        if (internalLinks.length > 0) {
          summary += `**Key Internal Links:**\n`;
          internalLinks.slice(0, 5).forEach(link => {
            summary += `- [${link.text || link.url}](${link.url})\n`;
          });
        }
      } catch (e) {
        summary += `**Links:** ${links.length} total\n`;
      }
    }
    
    summary += `\n`;
  });

  // Keyword and theme analysis
  summary += `---\n## 🎯 **Content Themes & Keyword Analysis**\n\n`;
  
  const allText = pages.map(page => page.markdown || '').join(' ');
  const words = allText.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq = {};
  
  // Filter out common words and count frequency
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an', 'as', 'from', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'you', 'your', 'yours', 'yourself', 'yourselves', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'could', 'should', 'ought', 'im', 'youre', 'hes', 'shes', 'its', 'were', 'theyre', 'ive', 'youve', 'weve', 'theyve', 'id', 'youd', 'hed', 'shed', 'wed', 'theyd', 'ill', 'youll', 'hell', 'shell', 'well', 'theyll', 'isnt', 'arent', 'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'doesnt', 'dont', 'didnt', 'wont', 'wouldnt', 'couldnt', 'shouldnt', 'let', 'lets', 'thats', 'whos', 'whats', 'heres', 'theres', 'whens', 'wheres', 'whys', 'hows', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  
  words.forEach(word => {
    if (word.length > 3 && !commonWords.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const topWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 25);
  
  summary += `**Top Keywords (${topWords.length}):**\n`;
  topWords.forEach(([word, count], index) => {
    summary += `${index + 1}. **${word}** (${count} occurrences)\n`;
  });

  // Content themes
  const aiKeywords = ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'automation', 'chatbot', 'gpt', 'claude', 'midjourney', 'tool', 'tools', 'agent', 'agents'];
  const techKeywords = ['technology', 'software', 'platform', 'api', 'integration', 'development', 'code', 'programming', 'database', 'cloud'];
  const businessKeywords = ['business', 'enterprise', 'startup', 'company', 'organization', 'team', 'workflow', 'productivity', 'efficiency', 'roi'];
  
  const aiCount = topWords.filter(([word]) => aiKeywords.includes(word)).length;
  const techCount = topWords.filter(([word]) => techKeywords.includes(word)).length;
  const businessCount = topWords.filter(([word]) => businessKeywords.includes(word)).length;
  
  summary += `\n**Content Theme Distribution:**\n`;
  summary += `- AI/ML Focus: ${aiCount} keywords\n`;
  summary += `- Technology: ${techCount} keywords\n`;
  summary += `- Business: ${businessCount} keywords\n`;

  // Media analysis
  summary += `\n---\n## 🖼️ **Media & Assets Analysis**\n\n`;
  
  const allImages = pages.flatMap(page => page.images || []);
  const allLinks = pages.flatMap(page => page.links || []);
  
  summary += `**Media Statistics:**\n`;
  summary += `- Total Images: ${allImages.length}\n`;
  summary += `- Total Links: ${allLinks.length}\n`;
  
  try {
    const hostname = new URL(pages[0].url).hostname;
    const internalLinks = allLinks.filter(link => link.url.includes(hostname));
    const externalLinks = allLinks.filter(link => !link.url.includes(hostname));
    summary += `- Internal Links: ${internalLinks.length}\n`;
    summary += `- External Links: ${externalLinks.length}\n`;
  } catch (e) {
    summary += `- Internal/External Links: Unable to determine\n`;
  }
  
  if (allImages.length > 0) {
    summary += `\n**Image Analysis:**\n`;
    const imagesWithAlt = allImages.filter(img => img.alt && img.alt.trim().length > 0);
    summary += `- Images with Alt Text: ${imagesWithAlt.length}/${allImages.length} (${Math.round(imagesWithAlt.length/allImages.length*100)}%)\n`;
    
    summary += `\n**Sample Images:**\n`;
    allImages.slice(0, 8).forEach((img, index) => {
      summary += `${index + 1}. ${img.alt || 'No alt text'} - \`${img.src}\`\n`;
    });
  }

  // Technical analysis
  summary += `\n---\n## 🔧 **Technical Analysis**\n\n`;
  
  summary += `**SEO Analysis:**\n`;
  let pagesWithTitle = 0;
  let pagesWithDescription = 0;
  let pagesWithKeywords = 0;
  
  pages.forEach(page => {
    if (page.metadata?.title) pagesWithTitle++;
    if (page.metadata?.description) pagesWithDescription++;
    if (page.metadata?.keywords) pagesWithKeywords++;
  });
  
  summary += `- Pages with Title Tags: ${pagesWithTitle}/${pages.length} (${Math.round(pagesWithTitle/pages.length*100)}%)\n`;
  summary += `- Pages with Meta Descriptions: ${pagesWithDescription}/${pages.length} (${Math.round(pagesWithDescription/pages.length*100)}%)\n`;
  summary += `- Pages with Keywords: ${pagesWithKeywords}/${pages.length} (${Math.round(pagesWithKeywords/pages.length*100)}%)\n`;
  
  summary += `\n**Content Quality Metrics:**\n`;
  const avgWordCount = Math.round(pages.reduce((sum, page) => sum + (page.markdown?.split(/\s+/).length || 0), 0) / pages.length);
  const avgCharCount = Math.round(pages.reduce((sum, page) => sum + (page.markdown?.length || 0), 0) / pages.length);
  
  summary += `- Average Word Count per Page: ${avgWordCount} words\n`;
  summary += `- Average Character Count per Page: ${avgCharCount} characters\n`;
  summary += `- Total Content Volume: ${pages.reduce((sum, page) => sum + (page.markdown?.split(/\s+/).length || 0), 0)} words\n`;

  // Performance insights
  summary += `\n---\n## 📊 **Performance & User Experience Insights**\n\n`;
  
  summary += `**Content Distribution:**\n`;
  summary += `- Total Pages: ${pages.length}\n`;
  summary += `- Content Pages: ${pages.filter(page => page.markdown && page.markdown.length > 100).length}\n`;
  summary += `- Landing Pages: ${mainPages.length}\n`;
  summary += `- Detail Pages: ${subPages.length}\n`;
  
  // Navigation analysis
  const navigationLinks = allLinks.filter(link => {
    const text = link.text?.toLowerCase() || '';
    return text.includes('home') || text.includes('about') || text.includes('contact') || text.includes('tools') || text.includes('pricing');
  });
  
  summary += `\n**Navigation Analysis:**\n`;
  summary += `- Navigation Links Found: ${navigationLinks.length}\n`;
  navigationLinks.forEach(link => {
    summary += `- [${link.text}](${link.url})\n`;
  });

  // Recommendations
  summary += `\n---\n## 💡 **Strategic Recommendations**\n\n`;
  
  summary += `### **Content Optimization:**\n`;
  if (pagesWithTitle < pages.length) {
    summary += `- ⚠️ Add missing title tags to ${pages.length - pagesWithTitle} pages\n`;
  }
  if (pagesWithDescription < pages.length) {
    summary += `- ⚠️ Add meta descriptions to ${pages.length - pagesWithDescription} pages\n`;
  }
  if (allImages.length > 0) {
    const imagesWithAlt = allImages.filter(img => img.alt && img.alt.trim().length > 0);
    if (imagesWithAlt.length < allImages.length) {
      summary += `- ⚠️ Add alt text to ${allImages.length - imagesWithAlt.length} images for accessibility\n`;
    }
  }
  summary += `- ✅ Consider adding structured data markup for better SEO\n`;
  summary += `- ✅ Implement Open Graph and Twitter Card meta tags\n\n`;
  
  summary += `### **User Experience Improvements:**\n`;
  summary += `- 🎯 Implement breadcrumb navigation for better user orientation\n`;
  summary += `- 🔍 Add search functionality for better content discovery\n`;
  summary += `- 📱 Ensure mobile responsiveness across all pages\n`;
  summary += `- ⚡ Optimize page load speeds for better performance\n\n`;
  
  summary += `### **Content Strategy:**\n`;
  summary += `- 📝 Expand content depth on key pages (target ${Math.max(500, avgWordCount * 1.5)} words per page)\n`;
  summary += `- 🔗 Improve internal linking structure\n`;
  summary += `- 📊 Add more visual content (images, infographics, videos)\n`;
  summary += `- 💬 Consider adding user-generated content (reviews, comments)\n`;

  // Competitive positioning
  summary += `\n---\n## 🏆 **Competitive Positioning Analysis**\n\n`;
  
  summary += `**Current Strengths:**\n`;
  summary += `- ✅ Comprehensive AI tool directory\n`;
  summary += `- ✅ User persona-based recommendations\n`;
  summary += `- ✅ Budget builder functionality\n`;
  summary += `- ✅ Real-time analytics tracking\n`;
  summary += `- ✅ Modern, responsive design\n\n`;
  
  summary += `**Growth Opportunities:**\n`;
  summary += `- 🚀 Expand tool database beyond current ${pages.length} pages\n`;
  summary += `- 🎓 Create educational content hub\n`;
  summary += `- 💰 Implement premium subscription features\n`;
  summary += `- 🤝 Add user reviews and community features\n`;
  summary += `- 📈 Develop advanced search and filtering capabilities\n`;

  summary += `\n---\n## 📈 **Next Steps & Action Items**\n\n`;
  
  summary += `**Immediate Actions (Next 30 Days):**\n`;
  summary += `1. 🔧 Fix missing meta tags and SEO elements\n`;
  summary += `2. 📝 Optimize content for target keywords\n`;
  summary += `3. 🖼️ Add alt text to all images\n`;
  summary += `4. 🔗 Improve internal linking structure\n\n`;
  
  summary += `**Medium-term Goals (Next 90 Days):**\n`;
  summary += `1. 🎯 Implement advanced search functionality\n`;
  summary += `2. 💰 Launch premium subscription features\n`;
  summary += `3. 📊 Create comprehensive analytics dashboard\n`;
  summary += `4. 🤝 Add user community features\n\n`;
  
  summary += `**Long-term Vision (Next 6 Months):**\n`;
  summary += `1. 🌍 Expand to international markets\n`;
  summary += `2. 📱 Develop mobile application\n`;
  summary += `3. 🎓 Create educational content platform\n`;
  summary += `4. 💼 Build enterprise solutions\n`;

  summary += `\n---\n**Analysis completed by:** Firecrawl Web Scraper\n**Date:** ${new Date().toISOString()}\n`;

  return summary;
}

async function main() {
  try {
    console.log('🎯 Starting comprehensive AI One Stop Shop analysis...\n');
    
    // For now, let's focus on the live site since local might not be accessible
    const sites = [
      { url: 'https://aionestopshop.com', name: 'AI One Stop Shop (Live Site)' }
    ];
    
    const results = {};
    
    for (const site of sites) {
      console.log(`\n🔍 Analyzing ${site.name}...`);
      const scrapeResult = await scrapeWebsite(site.url, site.name);
      
      if (scrapeResult) {
        const summary = generateComprehensiveSummary(scrapeResult, site.name);
        const filename = `${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.md`;
        
        fs.writeFileSync(filename, summary);
        
        results[site.name] = {
          filename,
          summary,
          scrapeResult,
          pagesCount: scrapeResult.pages.length
        };
        
        console.log(`✅ Analysis complete for ${site.name}`);
        console.log(`📄 Summary saved to: ${filename}`);
        console.log(`📊 Pages analyzed: ${scrapeResult.pages.length}`);
      } else {
        console.log(`❌ Failed to analyze ${site.name}`);
      }
    }
    
    console.log('\n🎉 Analysis completed!');
    console.log(`📁 Generated ${Object.keys(results).length} analysis files`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapeWebsite, generateComprehensiveSummary, main };
