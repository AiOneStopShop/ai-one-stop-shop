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

// AI Agents Data
const aiAgents = [
  // Research & Analysis Agents
  {
    name: "ResearchGPT",
    description: "AI research agent that can analyze documents, find information, and generate comprehensive reports",
    category: "AI Assistant",
    subcategory: "Research Agent",
    rating: 4.6,
    price: "$15/month",
    price_range: "paid",
    features: [
      "Document analysis",
      "Web research",
      "Report generation",
      "Citation tracking",
      "Data synthesis",
      "Academic writing",
      "Fact-checking",
      "Source verification"
    ],
    tags: [
      "research",
      "analysis",
      "academic",
      "reports",
      "documents",
      "fact-checking"
    ],
    image: "/images/tools/research-gpt.jpg",
    affiliate_link: "https://researchgpt.ai",
    popularity: 85,
    difficulty: "intermediate",
    use_case: [
      "Academic research",
      "Market analysis",
      "Competitive intelligence",
      "Document review",
      "Report writing",
      "Fact-checking"
    ],
    agent_type: "Research Agent",
    capabilities: [
      "Document processing",
      "Web crawling",
      "Data analysis",
      "Report generation",
      "Citation management"
    ],
    integrations: [
      "Google Scholar",
      "PubMed",
      "Web browsers",
      "Document formats",
      "Citation tools"
    ],
    pricing_model: "Subscription"
  },
  {
    name: "DataBot",
    description: "Intelligent data analysis agent that can process, analyze, and visualize complex datasets",
    category: "Data & Analytics",
    subcategory: "Data Agent",
    rating: 4.5,
    price: "$25/month",
    price_range: "paid",
    features: [
      "Data processing",
      "Statistical analysis",
      "Visualization creation",
      "Pattern recognition",
      "Predictive modeling",
      "Data cleaning",
      "Report generation",
      "Real-time monitoring"
    ],
    tags: [
      "data analysis",
      "statistics",
      "visualization",
      "machine learning",
      "predictive",
      "analytics"
    ],
    image: "/images/tools/databot.jpg",
    affiliate_link: "https://databot.ai",
    popularity: 80,
    difficulty: "intermediate",
    use_case: [
      "Business intelligence",
      "Market research",
      "Performance analysis",
      "Predictive analytics",
      "Data visualization",
      "Statistical modeling"
    ],
    agent_type: "Data Analysis Agent",
    capabilities: [
      "Data processing",
      "Statistical analysis",
      "Visualization",
      "Predictive modeling",
      "Real-time monitoring"
    ],
    integrations: [
      "Excel",
      "Google Sheets",
      "SQL databases",
      "API connections",
      "BI tools"
    ],
    pricing_model: "Subscription"
  },

  // Creative & Content Agents
  {
    name: "ContentCreator",
    description: "AI content creation agent that generates high-quality articles, social media posts, and marketing copy",
    category: "Text & Writing",
    subcategory: "Content Agent",
    rating: 4.4,
    price: "$20/month",
    price_range: "paid",
    features: [
      "Article writing",
      "Social media posts",
      "Marketing copy",
      "SEO optimization",
      "Content planning",
      "Brand voice consistency",
      "Multi-language support",
      "Content scheduling"
    ],
    tags: [
      "content creation",
      "writing",
      "marketing",
      "SEO",
      "social media",
      "copywriting"
    ],
    image: "/images/tools/content-creator.jpg",
    affiliate_link: "https://contentcreator.ai",
    popularity: 88,
    difficulty: "beginner",
    use_case: [
      "Content marketing",
      "Social media management",
      "Blog writing",
      "Email campaigns",
      "SEO content",
      "Brand messaging"
    ],
    agent_type: "Content Creation Agent",
    capabilities: [
      "Article writing",
      "Social media content",
      "Marketing copy",
      "SEO optimization",
      "Content planning"
    ],
    integrations: [
      "WordPress",
      "Social media platforms",
      "Email marketing tools",
      "CMS systems",
      "Analytics platforms"
    ],
    pricing_model: "Subscription"
  },
  {
    name: "DesignAgent",
    description: "AI design agent that creates logos, graphics, and visual content based on brand guidelines",
    category: "Image Generation",
    subcategory: "Design Agent",
    rating: 4.3,
    price: "$30/month",
    price_range: "paid",
    features: [
      "Logo design",
      "Graphic creation",
      "Brand consistency",
      "Template generation",
      "Color scheme analysis",
      "Design optimization",
      "Multiple formats",
      "Brand guidelines"
    ],
    tags: [
      "design",
      "graphics",
      "logo",
      "branding",
      "visual",
      "creative"
    ],
    image: "/images/tools/design-agent.jpg",
    affiliate_link: "https://designagent.ai",
    popularity: 75,
    difficulty: "beginner",
    use_case: [
      "Brand identity",
      "Marketing materials",
      "Social media graphics",
      "Logo design",
      "Visual content",
      "Brand consistency"
    ],
    agent_type: "Design Agent",
    capabilities: [
      "Logo design",
      "Graphic creation",
      "Brand consistency",
      "Template generation",
      "Color analysis"
    ],
    integrations: [
      "Adobe Creative Suite",
      "Canva",
      "Figma",
      "Social media platforms",
      "Brand management tools"
    ],
    pricing_model: "Subscription"
  },

  // Business & Productivity Agents
  {
    name: "SalesBot",
    description: "AI sales agent that qualifies leads, schedules meetings, and manages customer relationships",
    category: "Productivity",
    subcategory: "Sales Agent",
    rating: 4.6,
    price: "$50/month",
    price_range: "paid",
    features: [
      "Lead qualification",
      "Meeting scheduling",
      "Follow-up automation",
      "CRM integration",
      "Sales analytics",
      "Customer segmentation",
      "Pipeline management",
      "Performance tracking"
    ],
    tags: [
      "sales",
      "CRM",
      "lead generation",
      "automation",
      "customer relationship",
      "pipeline"
    ],
    image: "/images/tools/salesbot.jpg",
    affiliate_link: "https://salesbot.ai",
    popularity: 90,
    difficulty: "intermediate",
    use_case: [
      "Lead qualification",
      "Sales automation",
      "Customer relationship management",
      "Pipeline optimization",
      "Sales analytics",
      "Meeting scheduling"
    ],
    agent_type: "Sales Agent",
    capabilities: [
      "Lead qualification",
      "Meeting scheduling",
      "Follow-up automation",
      "CRM integration",
      "Sales analytics"
    ],
    integrations: [
      "Salesforce",
      "HubSpot",
      "Calendly",
      "Email platforms",
      "CRM systems"
    ],
    pricing_model: "Subscription"
  },
  {
    name: "SupportAgent",
    description: "AI customer support agent that handles inquiries, resolves issues, and provides 24/7 assistance",
    category: "AI Assistant",
    subcategory: "Support Agent",
    rating: 4.5,
    price: "$40/month",
    price_range: "paid",
    features: [
      "24/7 availability",
      "Multi-language support",
      "Issue resolution",
      "Knowledge base integration",
      "Ticket management",
      "Customer satisfaction tracking",
      "Escalation handling",
      "Analytics dashboard"
    ],
    tags: [
      "customer support",
      "help desk",
      "automation",
      "24/7",
      "troubleshooting",
      "customer service"
    ],
    image: "/images/tools/support-agent.jpg",
    affiliate_link: "https://supportagent.ai",
    popularity: 85,
    difficulty: "intermediate",
    use_case: [
      "Customer support",
      "Help desk automation",
      "Issue resolution",
      "24/7 assistance",
      "Ticket management",
      "Customer satisfaction"
    ],
    agent_type: "Customer Support Agent",
    capabilities: [
      "24/7 availability",
      "Multi-language support",
      "Issue resolution",
      "Ticket management",
      "Knowledge base integration"
    ],
    integrations: [
      "Zendesk",
      "Intercom",
      "Slack",
      "Email platforms",
      "CRM systems"
    ],
    pricing_model: "Subscription"
  },

  // Development & Technical Agents
  {
    name: "CodeAgent",
    description: "AI coding agent that writes, reviews, and optimizes code across multiple programming languages",
    category: "Code & Development",
    subcategory: "Code Agent",
    rating: 4.7,
    price: "$35/month",
    price_range: "paid",
    features: [
      "Code generation",
      "Code review",
      "Bug detection",
      "Performance optimization",
      "Documentation generation",
      "Testing automation",
      "Multi-language support",
      "Git integration"
    ],
    tags: [
      "coding",
      "programming",
      "development",
      "code review",
      "automation",
      "testing"
    ],
    image: "/images/tools/code-agent.jpg",
    affiliate_link: "https://codeagent.ai",
    popularity: 92,
    difficulty: "advanced",
    use_case: [
      "Software development",
      "Code review",
      "Bug fixing",
      "Performance optimization",
      "Documentation",
      "Testing automation"
    ],
    agent_type: "Code Development Agent",
    capabilities: [
      "Code generation",
      "Code review",
      "Bug detection",
      "Performance optimization",
      "Documentation generation"
    ],
    integrations: [
      "GitHub",
      "GitLab",
      "VS Code",
      "Jira",
      "Testing frameworks"
    ],
    pricing_model: "Subscription"
  },
  {
    name: "DevOpsBot",
    description: "AI DevOps agent that automates deployment, monitoring, and infrastructure management",
    category: "Code & Development",
    subcategory: "DevOps Agent",
    rating: 4.4,
    price: "$45/month",
    price_range: "paid",
    features: [
      "Automated deployment",
      "Infrastructure monitoring",
      "Performance optimization",
      "Security scanning",
      "Backup management",
      "Scaling automation",
      "Incident response",
      "Cost optimization"
    ],
    tags: [
      "devops",
      "deployment",
      "monitoring",
      "infrastructure",
      "automation",
      "cloud"
    ],
    image: "/images/tools/devops-bot.jpg",
    affiliate_link: "https://devopsbot.ai",
    popularity: 78,
    difficulty: "advanced",
    use_case: [
      "Automated deployment",
      "Infrastructure monitoring",
      "Performance optimization",
      "Security management",
      "Cost optimization",
      "Incident response"
    ],
    agent_type: "DevOps Agent",
    capabilities: [
      "Automated deployment",
      "Infrastructure monitoring",
      "Performance optimization",
      "Security scanning",
      "Backup management"
    ],
    integrations: [
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "CI/CD tools"
    ],
    pricing_model: "Subscription"
  },

  // Specialized Agents
  {
    name: "LegalAssistant",
    description: "AI legal agent that reviews contracts, analyzes legal documents, and provides legal insights",
    category: "Productivity",
    subcategory: "Legal Agent",
    rating: 4.3,
    price: "$60/month",
    price_range: "paid",
    features: [
      "Contract review",
      "Legal document analysis",
      "Compliance checking",
      "Risk assessment",
      "Legal research",
      "Document generation",
      "Case law analysis",
      "Regulatory updates"
    ],
    tags: [
      "legal",
      "contracts",
      "compliance",
      "risk assessment",
      "document review",
      "law"
    ],
    image: "/images/tools/legal-assistant.jpg",
    affiliate_link: "https://legalassistant.ai",
    popularity: 70,
    difficulty: "advanced",
    use_case: [
      "Contract review",
      "Legal document analysis",
      "Compliance checking",
      "Risk assessment",
      "Legal research",
      "Document generation"
    ],
    agent_type: "Legal Agent",
    capabilities: [
      "Contract review",
      "Legal document analysis",
      "Compliance checking",
      "Risk assessment",
      "Legal research"
    ],
    integrations: [
      "Document management systems",
      "Legal databases",
      "Compliance platforms",
      "E-signature tools",
      "Case management systems"
    ],
    pricing_model: "Subscription"
  },
  {
    name: "FinanceBot",
    description: "AI financial agent that analyzes markets, manages portfolios, and provides investment insights",
    category: "Data & Analytics",
    subcategory: "Finance Agent",
    rating: 4.5,
    price: "$40/month",
    price_range: "paid",
    features: [
      "Market analysis",
      "Portfolio management",
      "Risk assessment",
      "Investment recommendations",
      "Financial reporting",
      "Tax optimization",
      "Real-time monitoring",
      "Performance tracking"
    ],
    tags: [
      "finance",
      "investment",
      "trading",
      "portfolio",
      "market analysis",
      "risk management"
    ],
    image: "/images/tools/finance-bot.jpg",
    affiliate_link: "https://financebot.ai",
    popularity: 82,
    difficulty: "intermediate",
    use_case: [
      "Investment analysis",
      "Portfolio management",
      "Risk assessment",
      "Market research",
      "Financial planning",
      "Performance tracking"
    ],
    agent_type: "Financial Agent",
    capabilities: [
      "Market analysis",
      "Portfolio management",
      "Risk assessment",
      "Investment recommendations",
      "Financial reporting"
    ],
    integrations: [
      "Trading platforms",
      "Financial data providers",
      "Portfolio management tools",
      "Tax software",
      "Banking APIs"
    ],
    pricing_model: "Subscription"
  }
]

async function addAgents() {
  console.log('🤖 Adding AI Agents to Supabase...\n')
  
  try {
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    for (const agent of aiAgents) {
      try {
        // Check if agent already exists
        const { data: existing } = await supabase
          .from('ai_tools')
          .select('id')
          .eq('name', agent.name)
          .single()

        if (existing) {
          console.log(`⚠️  Agent "${agent.name}" already exists, skipping...`)
          skippedCount++
          continue
        }

        // Add the agent
        await supabase
          .from('ai_tools')
          .insert(agent)

        successCount++
        console.log(`✅ Added: ${agent.name} (${agent.agent_type})`)
      } catch (error) {
        errorCount++
        console.log(`❌ Error adding ${agent.name}:`, error.message)
      }
    }

    console.log(`\n🎉 Operation complete!`)
    console.log(`✅ Successfully added: ${successCount} AI agents`)
    console.log(`⚠️  Skipped (already exists): ${skippedCount} agents`)
    if (errorCount > 0) {
      console.log(`❌ Failed to add: ${errorCount} agents`)
    }

    // Get total count
    const { data: allTools } = await supabase
      .from('ai_tools')
      .select('id')

    console.log(`📊 Total tools in database: ${allTools?.length || 0}`)

    // Get agent count
    const { data: agents } = await supabase
      .from('ai_tools')
      .select('id')
      .not('agent_type', 'is', null)

    console.log(`🤖 Total AI agents: ${agents?.length || 0}`)

  } catch (error) {
    console.log('❌ Operation failed:', error.message)
  }
}

addAgents()
