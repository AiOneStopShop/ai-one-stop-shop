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
  // AI Assistants & Chatbots
  {
    name: "Gemini",
    description: "Google's AI assistant for creative and analytical tasks",
    category: "AI Assistant",
    subcategory: "Chatbots",
    rating: 4.6,
    price: "Free - $20/month",
    price_range: "freemium",
    features: ["Multimodal AI", "Creative writing", "Code generation", "Image analysis"],
    tags: ["AI assistant", "multimodal", "google", "creative"],
    image: "/images/tools/gemini.jpg",
    affiliate_link: "https://gemini.google.com",
    popularity: 90,
    difficulty: "beginner",
    use_case: ["Content creation", "Image analysis", "Research", "Coding"]
  },
  {
    name: "Pi",
    description: "Personal AI assistant focused on conversation and emotional intelligence",
    category: "AI Assistant",
    subcategory: "Chatbots",
    rating: 4.4,
    price: "Free",
    price_range: "free",
    features: ["Emotional intelligence", "Conversational AI", "Personal assistant", "Memory"],
    tags: ["AI assistant", "conversation", "emotional", "personal"],
    image: "/images/tools/pi.jpg",
    affiliate_link: "https://pi.ai",
    popularity: 80,
    difficulty: "beginner",
    use_case: ["Personal assistance", "Conversation", "Mental health", "Learning"]
  },
  {
    name: "Character.AI",
    description: "Create and chat with AI characters and personalities",
    category: "AI Assistant",
    subcategory: "Character Chat",
    rating: 4.3,
    price: "Free - $9.99/month",
    price_range: "freemium",
    features: ["Character creation", "Roleplay", "Storytelling", "Personality AI"],
    tags: ["character", "roleplay", "storytelling", "entertainment"],
    image: "/images/tools/character-ai.jpg",
    affiliate_link: "https://character.ai",
    popularity: 85,
    difficulty: "beginner",
    use_case: ["Entertainment", "Storytelling", "Roleplay", "Creative writing"]
  },

  // Image Generation
  {
    name: "Midjourney",
    description: "AI art generation tool for creating stunning visual artwork",
    category: "Image Generation",
    subcategory: "Art Creation",
    rating: 4.8,
    price: "$10/month",
    price_range: "paid",
    features: ["Art generation", "Style customization", "High resolution", "Creative control"],
    tags: ["art", "image generation", "creative", "visual"],
    image: "/images/tools/midjourney.jpg",
    affiliate_link: "https://midjourney.com",
    popularity: 95,
    difficulty: "intermediate",
    use_case: ["Art creation", "Design", "Marketing", "Entertainment"]
  },
  {
    name: "DALL-E 3",
    description: "OpenAI's advanced image generation model",
    category: "Image Generation",
    subcategory: "Art Creation",
    rating: 4.7,
    price: "$20/month",
    price_range: "paid",
    features: ["High-quality images", "Text-to-image", "Style transfer", "Creative variations"],
    tags: ["image generation", "openai", "art", "creative"],
    image: "/images/tools/dalle.jpg",
    affiliate_link: "https://openai.com/dall-e-2",
    popularity: 92,
    difficulty: "intermediate",
    use_case: ["Art creation", "Design", "Marketing", "Content creation"]
  },
  {
    name: "Stable Diffusion",
    description: "Open-source image generation model for creative projects",
    category: "Image Generation",
    subcategory: "Art Creation",
    rating: 4.5,
    price: "Free - $20/month",
    price_range: "freemium",
    features: ["Open source", "Custom models", "Local deployment", "Style customization"],
    tags: ["open source", "image generation", "customizable", "local"],
    image: "/images/tools/stable-diffusion.jpg",
    affiliate_link: "https://stability.ai",
    popularity: 88,
    difficulty: "advanced",
    use_case: ["Art creation", "Research", "Custom models", "Development"]
  },

  // Video Creation
  {
    name: "Runway",
    description: "AI-powered video editing and generation platform",
    category: "Video Creation",
    subcategory: "Video Editing",
    rating: 4.6,
    price: "$15/month",
    price_range: "paid",
    features: ["Video generation", "Motion graphics", "Green screen", "Text-to-video"],
    tags: ["video", "editing", "generation", "motion"],
    image: "/images/tools/runway.jpg",
    affiliate_link: "https://runwayml.com",
    popularity: 85,
    difficulty: "intermediate",
    use_case: ["Video editing", "Content creation", "Marketing", "Entertainment"]
  },
  {
    name: "Synthesia",
    description: "AI video generation with virtual presenters",
    category: "Video Creation",
    subcategory: "Video Generation",
    rating: 4.4,
    price: "$30/month",
    price_range: "paid",
    features: ["Virtual presenters", "Text-to-speech", "Custom avatars", "Multilingual"],
    tags: ["video", "presentation", "avatar", "multilingual"],
    image: "/images/tools/synthesia.jpg",
    affiliate_link: "https://synthesia.io",
    popularity: 80,
    difficulty: "beginner",
    use_case: ["Training videos", "Marketing", "Education", "Presentations"]
  },
  {
    name: "Pika Labs",
    description: "AI-powered video generation from text and images",
    category: "Video Creation",
    subcategory: "Video Generation",
    rating: 4.5,
    price: "Free - $20/month",
    price_range: "freemium",
    features: ["Text-to-video", "Image-to-video", "Style transfer", "Animation"],
    tags: ["video generation", "animation", "text-to-video", "creative"],
    image: "/images/tools/pika.jpg",
    affiliate_link: "https://pika.art",
    popularity: 82,
    difficulty: "intermediate",
    use_case: ["Content creation", "Animation", "Marketing", "Entertainment"]
  },

  // Text & Writing
  {
    name: "Jasper",
    description: "AI writing assistant for marketing and content creation",
    category: "Text & Writing",
    subcategory: "Content Writing",
    rating: 4.5,
    price: "$39/month",
    price_range: "paid",
    features: ["Content writing", "Marketing copy", "SEO optimization", "Brand voice"],
    tags: ["writing", "marketing", "content", "seo"],
    image: "/images/tools/jasper.jpg",
    affiliate_link: "https://jasper.ai",
    popularity: 88,
    difficulty: "beginner",
    use_case: ["Content marketing", "Copywriting", "SEO", "Brand content"]
  },
  {
    name: "Copy.ai",
    description: "AI copywriting tool for marketing and sales content",
    category: "Text & Writing",
    subcategory: "Copywriting",
    rating: 4.4,
    price: "$36/month",
    price_range: "paid",
    features: ["Copywriting", "Marketing content", "Social media", "Email campaigns"],
    tags: ["copywriting", "marketing", "social media", "sales"],
    image: "/images/tools/copy-ai.jpg",
    affiliate_link: "https://copy.ai",
    popularity: 85,
    difficulty: "beginner",
    use_case: ["Marketing copy", "Social media", "Email marketing", "Sales content"]
  },
  {
    name: "Grammarly",
    description: "AI-powered writing assistant for grammar and style",
    category: "Text & Writing",
    subcategory: "Writing Assistant",
    rating: 4.6,
    price: "Free - $12/month",
    price_range: "freemium",
    features: ["Grammar checking", "Style suggestions", "Plagiarism detection", "Writing insights"],
    tags: ["grammar", "writing", "editing", "style"],
    image: "/images/tools/grammarly.jpg",
    affiliate_link: "https://grammarly.com",
    popularity: 90,
    difficulty: "beginner",
    use_case: ["Writing improvement", "Editing", "Academic writing", "Professional communication"]
  },

  // Code & Development
  {
    name: "GitHub Copilot",
    description: "AI pair programmer for code completion and suggestions",
    category: "Code & Development",
    subcategory: "Code Assistant",
    rating: 4.7,
    price: "$10/month",
    price_range: "paid",
    features: ["Code completion", "Function suggestions", "Documentation", "Multi-language support"],
    tags: ["coding", "programming", "github", "development"],
    image: "/images/tools/github-copilot.jpg",
    affiliate_link: "https://github.com/features/copilot",
    popularity: 92,
    difficulty: "intermediate",
    use_case: ["Software development", "Code review", "Learning programming", "Productivity"]
  },
  {
    name: "Cursor",
    description: "AI-powered code editor with advanced features",
    category: "Code & Development",
    subcategory: "Code Editor",
    rating: 4.5,
    price: "Free - $20/month",
    price_range: "freemium",
    features: ["AI code completion", "Chat interface", "Code explanation", "Refactoring"],
    tags: ["code editor", "AI assistant", "development", "productivity"],
    image: "/images/tools/cursor.jpg",
    affiliate_link: "https://cursor.sh",
    popularity: 85,
    difficulty: "intermediate",
    use_case: ["Software development", "Code review", "Learning", "Productivity"]
  },
  {
    name: "Replit",
    description: "Online IDE with AI-powered coding assistance",
    category: "Code & Development",
    subcategory: "Online IDE",
    rating: 4.3,
    price: "Free - $20/month",
    price_range: "freemium",
    features: ["Online IDE", "AI assistance", "Collaboration", "Deployment"],
    tags: ["online ide", "collaboration", "deployment", "education"],
    image: "/images/tools/replit.jpg",
    affiliate_link: "https://replit.com",
    popularity: 80,
    difficulty: "beginner",
    use_case: ["Learning programming", "Collaboration", "Prototyping", "Education"]
  },

  // Audio & Music
  {
    name: "Suno",
    description: "AI music generation from text descriptions",
    category: "Audio & Music",
    subcategory: "Music Generation",
    rating: 4.6,
    price: "Free - $10/month",
    price_range: "freemium",
    features: ["Text-to-music", "Multiple genres", "High quality", "Customization"],
    tags: ["music", "generation", "text-to-music", "creative"],
    image: "/images/tools/suno.jpg",
    affiliate_link: "https://suno.ai",
    popularity: 88,
    difficulty: "beginner",
    use_case: ["Music creation", "Content creation", "Background music", "Creative projects"]
  },
  {
    name: "ElevenLabs",
    description: "AI voice generation and text-to-speech platform",
    category: "Audio & Music",
    subcategory: "Voice Generation",
    rating: 4.5,
    price: "$22/month",
    price_range: "paid",
    features: ["Voice cloning", "Text-to-speech", "Voice design", "Emotion control"],
    tags: ["voice", "text-to-speech", "cloning", "audio"],
    image: "/images/tools/elevenlabs.jpg",
    affiliate_link: "https://elevenlabs.io",
    popularity: 85,
    difficulty: "intermediate",
    use_case: ["Podcasting", "Content creation", "Accessibility", "Entertainment"]
  },
  {
    name: "Mubert",
    description: "AI-powered music generation for content creators",
    category: "Audio & Music",
    subcategory: "Music Generation",
    rating: 4.3,
    price: "$14/month",
    price_range: "paid",
    features: ["Royalty-free music", "Custom generation", "API access", "Multiple styles"],
    tags: ["music", "royalty-free", "content creation", "api"],
    image: "/images/tools/mubert.jpg",
    affiliate_link: "https://mubert.com",
    popularity: 75,
    difficulty: "beginner",
    use_case: ["Content creation", "Background music", "Streaming", "Marketing"]
  },

  // Data & Analytics
  {
    name: "Tableau",
    description: "AI-powered data visualization and analytics platform",
    category: "Data & Analytics",
    subcategory: "Data Visualization",
    rating: 4.6,
    price: "$70/month",
    price_range: "paid",
    features: ["Data visualization", "Business intelligence", "AI insights", "Collaboration"],
    tags: ["data", "visualization", "analytics", "business"],
    image: "/images/tools/tableau.jpg",
    affiliate_link: "https://tableau.com",
    popularity: 90,
    difficulty: "intermediate",
    use_case: ["Business intelligence", "Data analysis", "Reporting", "Decision making"]
  },
  {
    name: "Power BI",
    description: "Microsoft's business analytics and data visualization tool",
    category: "Data & Analytics",
    subcategory: "Business Intelligence",
    rating: 4.5,
    price: "$9.99/month",
    price_range: "paid",
    features: ["Business intelligence", "Data modeling", "AI insights", "Integration"],
    tags: ["microsoft", "business intelligence", "analytics", "data"],
    image: "/images/tools/power-bi.jpg",
    affiliate_link: "https://powerbi.microsoft.com",
    popularity: 88,
    difficulty: "intermediate",
    use_case: ["Business reporting", "Data analysis", "Dashboard creation", "Decision making"]
  },
  {
    name: "Looker",
    description: "Modern business intelligence and data analytics platform",
    category: "Data & Analytics",
    subcategory: "Business Intelligence",
    rating: 4.4,
    price: "Custom pricing",
    price_range: "enterprise",
    features: ["Data modeling", "SQL generation", "Embedded analytics", "API access"],
    tags: ["business intelligence", "data modeling", "enterprise", "analytics"],
    image: "/images/tools/looker.jpg",
    affiliate_link: "https://looker.com",
    popularity: 82,
    difficulty: "advanced",
    use_case: ["Enterprise analytics", "Data modeling", "Embedded BI", "Custom dashboards"]
  },

  // Productivity
  {
    name: "Notion AI",
    description: "AI-powered workspace for notes, docs, and collaboration",
    category: "Productivity",
    subcategory: "Note Taking",
    rating: 4.5,
    price: "Free - $10/month",
    price_range: "freemium",
    features: ["AI writing", "Task management", "Database", "Collaboration"],
    tags: ["productivity", "notes", "collaboration", "organization"],
    image: "/images/tools/notion.jpg",
    affiliate_link: "https://notion.so",
    popularity: 92,
    difficulty: "beginner",
    use_case: ["Note taking", "Project management", "Knowledge base", "Team collaboration"]
  },
  {
    name: "Tome",
    description: "AI-powered presentation and storytelling platform",
    category: "Productivity",
    subcategory: "Presentations",
    rating: 4.4,
    price: "Free - $20/month",
    price_range: "freemium",
    features: ["AI presentations", "Storytelling", "Visual design", "Collaboration"],
    tags: ["presentations", "storytelling", "visual", "collaboration"],
    image: "/images/tools/tome.jpg",
    affiliate_link: "https://tome.app",
    popularity: 85,
    difficulty: "beginner",
    use_case: ["Presentations", "Storytelling", "Marketing", "Education"]
  },
  {
    name: "Otter.ai",
    description: "AI-powered meeting transcription and collaboration",
    category: "Productivity",
    subcategory: "Transcription",
    rating: 4.3,
    price: "$10/month",
    price_range: "paid",
    features: ["Meeting transcription", "Speaker identification", "Search", "Collaboration"],
    tags: ["transcription", "meetings", "collaboration", "productivity"],
    image: "/images/tools/otter.jpg",
    affiliate_link: "https://otter.ai",
    popularity: 80,
    difficulty: "beginner",
    use_case: ["Meeting notes", "Interviews", "Content creation", "Accessibility"]
  }
]

async function addTools() {
  console.log('🚀 Adding more AI tools to Supabase...\n')
  
  try {
    let successCount = 0
    let errorCount = 0

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
