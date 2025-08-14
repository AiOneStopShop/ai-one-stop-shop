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

// Additional AI Tools Data
const additionalTools = [
  // Automation & Workflow
  {
    name: "Zapier",
    description: "Automate workflows by connecting your favorite apps and services",
    category: "Productivity",
    subcategory: "Automation",
    rating: 4.7,
    price: "Free - $19.99/month",
    price_range: "freemium",
    features: [
      "App integrations",
      "Workflow automation",
      "Trigger-based actions",
      "Multi-step workflows",
      "Scheduled tasks",
      "Data transfer",
      "API connections",
      "Custom webhooks"
    ],
    tags: [
      "automation",
      "workflow",
      "integrations",
      "productivity",
      "apps",
      "zaps"
    ],
    image: "/images/tools/zapier.jpg",
    affiliate_link: "https://zapier.com",
    popularity: 95,
    difficulty: "beginner",
    use_case: [
      "Workflow automation",
      "App integrations",
      "Data synchronization",
      "Marketing automation",
      "Customer service",
      "Project management"
    ]
  },
  {
    name: "n8n",
    description: "Open-source workflow automation platform for developers",
    category: "Productivity",
    subcategory: "Automation",
    rating: 4.5,
    price: "Free - $20/month",
    price_range: "freemium",
    features: [
      "Open source",
      "Visual workflow builder",
      "Node-based automation",
      "Self-hosted option",
      "API integrations",
      "Custom nodes",
      "Webhook support",
      "Data transformation"
    ],
    tags: [
      "automation",
      "open source",
      "workflow",
      "developer",
      "self-hosted",
      "nodes"
    ],
    image: "/images/tools/n8n.jpg",
    affiliate_link: "https://n8n.io",
    popularity: 85,
    difficulty: "intermediate",
    use_case: [
      "Developer automation",
      "API workflows",
      "Data processing",
      "Custom integrations",
      "Backend automation",
      "DevOps workflows"
    ]
  },
  {
    name: "Gumloop",
    description: "AI-powered automation platform for business processes",
    category: "Productivity",
    subcategory: "Automation",
    rating: 4.4,
    price: "$29/month",
    price_range: "paid",
    features: [
      "AI automation",
      "Process optimization",
      "Business workflows",
      "Data extraction",
      "Document processing",
      "Custom automation",
      "Analytics dashboard",
      "Team collaboration"
    ],
    tags: [
      "automation",
      "AI",
      "business",
      "process",
      "workflow",
      "productivity"
    ],
    image: "/images/tools/gumloop.jpg",
    affiliate_link: "https://gumloop.com",
    popularity: 75,
    difficulty: "intermediate",
    use_case: [
      "Business process automation",
      "Document processing",
      "Data extraction",
      "Workflow optimization",
      "Team productivity",
      "Process management"
    ]
  },

  // AI & Development
  {
    name: "OpenRouter",
    description: "Unified API gateway for accessing multiple AI models",
    category: "AI Assistant",
    subcategory: "API Gateway",
    rating: 4.6,
    price: "Pay per use",
    price_range: "paid",
    features: [
      "Multiple AI models",
      "Unified API",
      "Cost optimization",
      "Model comparison",
      "Rate limiting",
      "Usage analytics",
      "Developer tools",
      "Enterprise features"
    ],
    tags: [
      "AI models",
      "API gateway",
      "unified",
      "developer",
      "cost optimization",
      "models"
    ],
    image: "/images/tools/openrouter.jpg",
    affiliate_link: "https://openrouter.ai",
    popularity: 88,
    difficulty: "intermediate",
    use_case: [
      "AI model access",
      "Cost optimization",
      "Model comparison",
      "Developer tools",
      "API management",
      "AI integration"
    ]
  },
  {
    name: "Flowise",
    description: "Open-source visual AI development platform",
    category: "Code & Development",
    subcategory: "AI Development",
    rating: 4.4,
    price: "Free",
    price_range: "free",
    features: [
      "Visual AI builder",
      "Open source",
      "LangChain integration",
      "Custom flows",
      "API generation",
      "Chatbot creation",
      "Model integration",
      "Deployment tools"
    ],
    tags: [
      "AI development",
      "visual builder",
      "open source",
      "langchain",
      "chatbot",
      "flows"
    ],
    image: "/images/tools/flowise.jpg",
    affiliate_link: "https://flowiseai.com",
    popularity: 82,
    difficulty: "intermediate",
    use_case: [
      "AI application development",
      "Chatbot creation",
      "Custom AI flows",
      "LangChain projects",
      "AI prototyping",
      "Visual AI building"
    ]
  },

  // Design & Development
  {
    name: "Windersurfer",
    description: "AI-powered design and prototyping platform",
    category: "Productivity",
    subcategory: "Design",
    rating: 4.3,
    price: "$15/month",
    price_range: "paid",
    features: [
      "AI design generation",
      "Prototyping",
      "Design collaboration",
      "Component library",
      "Design system",
      "Export tools",
      "Version control",
      "Team workspace"
    ],
    tags: [
      "design",
      "prototyping",
      "AI design",
      "collaboration",
      "components",
      "visual"
    ],
    image: "/images/tools/windersurfer.jpg",
    affiliate_link: "https://windersurfer.com",
    popularity: 70,
    difficulty: "beginner",
    use_case: [
      "UI/UX design",
      "Prototyping",
      "Design collaboration",
      "Component design",
      "Visual design",
      "Design systems"
    ]
  },
  {
    name: "Lovable",
    description: "AI-powered customer feedback and sentiment analysis platform",
    category: "Data & Analytics",
    subcategory: "Customer Analytics",
    rating: 4.5,
    price: "$99/month",
    price_range: "paid",
    features: [
      "Sentiment analysis",
      "Customer feedback",
      "Survey automation",
      "Real-time insights",
      "NPS tracking",
      "Customer journey",
      "Integration tools",
      "Analytics dashboard"
    ],
    tags: [
      "customer feedback",
      "sentiment analysis",
      "NPS",
      "analytics",
      "surveys",
      "customer experience"
    ],
    image: "/images/tools/lovable.jpg",
    affiliate_link: "https://lovable.com",
    popularity: 78,
    difficulty: "beginner",
    use_case: [
      "Customer feedback",
      "Sentiment analysis",
      "NPS tracking",
      "Customer experience",
      "Product research",
      "Customer insights"
    ]
  },
  {
    name: "Vercel",
    description: "Cloud platform for static sites and serverless functions",
    category: "Code & Development",
    subcategory: "Deployment",
    rating: 4.8,
    price: "Free - $20/month",
    price_range: "freemium",
    features: [
      "Static site hosting",
      "Serverless functions",
      "Edge computing",
      "Git integration",
      "Automatic deployments",
      "Performance optimization",
      "Analytics",
      "Team collaboration"
    ],
    tags: [
      "deployment",
      "hosting",
      "serverless",
      "static sites",
      "git",
      "performance"
    ],
    image: "/images/tools/vercel.jpg",
    affiliate_link: "https://vercel.com",
    popularity: 95,
    difficulty: "beginner",
    use_case: [
      "Web deployment",
      "Static site hosting",
      "Serverless functions",
      "Frontend hosting",
      "Performance optimization",
      "Team collaboration"
    ]
  },
  {
    name: "Figma",
    description: "Collaborative design platform for teams",
    category: "Productivity",
    subcategory: "Design",
    rating: 4.7,
    price: "Free - $12/month",
    price_range: "freemium",
    features: [
      "Collaborative design",
      "Prototyping",
      "Design systems",
      "Component library",
      "Real-time editing",
      "Version control",
      "Developer handoff",
      "Plugin ecosystem"
    ],
    tags: [
      "design",
      "collaboration",
      "prototyping",
      "UI/UX",
      "components",
      "visual design"
    ],
    image: "/images/tools/figma.jpg",
    affiliate_link: "https://figma.com",
    popularity: 98,
    difficulty: "beginner",
    use_case: [
      "UI/UX design",
      "Team collaboration",
      "Prototyping",
      "Design systems",
      "Visual design",
      "Developer handoff"
    ]
  }
]

async function addTools() {
  console.log('🚀 Adding more AI tools to Supabase...\n')
  
  try {
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    for (const tool of additionalTools) {
      try {
        // Check if tool already exists
        const { data: existing } = await supabase
          .from('ai_tools')
          .select('id')
          .eq('name', tool.name)
          .single()

        if (existing) {
          console.log(`⚠️  Tool "${tool.name}" already exists, skipping...`)
          skippedCount++
          continue
        }

        // Add the tool
        await supabase
          .from('ai_tools')
          .insert(tool)

        successCount++
        console.log(`✅ Added: ${tool.name}`)
      } catch (error) {
        errorCount++
        console.log(`❌ Error adding ${tool.name}:`, error.message)
      }
    }

    console.log(`\n🎉 Operation complete!`)
    console.log(`✅ Successfully added: ${successCount} tools`)
    console.log(`⚠️  Skipped (already exists): ${skippedCount} tools`)
    if (errorCount > 0) {
      console.log(`❌ Failed to add: ${errorCount} tools`)
    }

    // Get total count
    const { data: allTools } = await supabase
      .from('ai_tools')
      .select('id')

    console.log(`📊 Total tools in database: ${allTools?.length || 0}`)

  } catch (error) {
    console.log('❌ Operation failed:', error.message)
  }
}

addTools()
