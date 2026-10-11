// Fallback data for static site generation
// Originally auto-generated 2026-10-10T19:38:10.750Z
// MANUALLY CORRECTED 2026-10-11:
// - placeholder editorial scores (85/70) set to null
// - Stable Diffusion XL and AgentGPT no longer marked free
// - Cursor, GitHub Copilot, and Grammarly marked has_free_tier (Hobby / Copilot Free / Grammarly Free)

export const fallbackTools = [
  {
    "id": "5c9e644a-9506-4a30-93c0-ad0af8030dcd",
    "slug": "chatgpt-plus",
    "name": "ChatGPT Plus",
    "tagline": "Advanced AI assistant for writing, coding, and problem-solving",
    "description": "Advanced AI assistant for writing, coding, and problem-solving",
    "website_url": "https://chat.openai.com",
    "source_url": "https://chat.openai.com",
    "pricing_summary": "$20/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web",
      "iOS",
      "Android"
    ],
    "features": [
      "Advanced reasoning",
      "Code execution",
      "Web browsing",
      "Image generation"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "2",
        "is_primary": true,
        "categories": {
          "id": "2",
          "slug": "productivity",
          "name": "Productivity",
          "icon": "⚡",
          "description": "AI tools to boost productivity",
          "sort_order": 2,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "3d626c74-937e-4a96-870c-07b89a5c7fff",
    "slug": "claude-pro",
    "name": "Claude Pro",
    "tagline": "Anthropic's powerful AI for analysis, writing, and coding",
    "description": "Anthropic's powerful AI for analysis, writing, and coding",
    "website_url": "https://claude.ai",
    "source_url": "https://claude.ai",
    "pricing_summary": "$20/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web"
    ],
    "features": [
      "Long context",
      "Ethical AI",
      "Code generation",
      "Document analysis"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "2",
        "is_primary": true,
        "categories": {
          "id": "2",
          "slug": "productivity",
          "name": "Productivity",
          "icon": "⚡",
          "description": "AI tools to boost productivity",
          "sort_order": 2,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "0750cfda-7e2e-4294-bfbd-4669b601936c",
    "slug": "midjourney",
    "name": "Midjourney",
    "tagline": "Create stunning AI-generated images and art",
    "description": "Create stunning AI-generated images and art",
    "website_url": "https://midjourney.com",
    "source_url": "https://midjourney.com",
    "pricing_summary": "$10/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Discord",
      "Web"
    ],
    "features": [
      "Image generation",
      "Style variations",
      "Upscaling",
      "Community gallery"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "4",
        "is_primary": true,
        "categories": {
          "id": "4",
          "slug": "design",
          "name": "Design",
          "icon": "🎨",
          "description": "AI tools for design and creativity",
          "sort_order": 4,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "de3c2b5e-147a-4008-b002-cc597878de2b",
    "slug": "github-copilot",
    "name": "GitHub Copilot",
    "tagline": "AI pair programmer that helps you code faster",
    "description": "AI pair programmer that helps you code faster",
    "website_url": "https://github.com/features/copilot",
    "source_url": "https://github.com/features/copilot",
    "pricing_summary": "$10/month",
    "pricing_model": "subscription",
    "has_free_tier": true,
    "platforms": [
      "VS Code",
      "JetBrains",
      "Neovim"
    ],
    "features": [
      "Code completion",
      "Multiple languages",
      "IDE integration",
      "Code suggestions"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "1",
        "is_primary": true,
        "categories": {
          "id": "1",
          "slug": "coding",
          "name": "Coding",
          "icon": "💻",
          "description": "AI tools for software development",
          "sort_order": 1,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "534344ff-cf6a-4e79-9975-732cfc72da97",
    "slug": "cursor",
    "name": "Cursor",
    "tagline": "The AI-first code editor built for pair programming with AI",
    "description": "The AI-first code editor built for pair programming with AI",
    "website_url": "https://cursor.com",
    "source_url": "https://cursor.com",
    "pricing_summary": "$20/month",
    "pricing_model": "subscription",
    "has_free_tier": true,
    "platforms": [
      "Desktop"
    ],
    "features": [
      "AI code generation",
      "Natural language editing",
      "Codebase understanding",
      "Multi-file editing"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "1",
        "is_primary": true,
        "categories": {
          "id": "1",
          "slug": "coding",
          "name": "Coding",
          "icon": "💻",
          "description": "AI tools for software development",
          "sort_order": 1,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "3de0ca7c-5b7a-482e-a0d1-98960dc2df03",
    "slug": "replit-agent",
    "name": "Replit Agent",
    "tagline": "Build complete apps from natural language descriptions",
    "description": "Build complete apps from natural language descriptions",
    "website_url": "https://replit.com",
    "source_url": "https://replit.com",
    "pricing_summary": "$25/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web"
    ],
    "features": [
      "Full-stack generation",
      "Deployment included",
      "Real-time collaboration",
      "Database integration"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "1",
        "is_primary": true,
        "categories": {
          "id": "1",
          "slug": "coding",
          "name": "Coding",
          "icon": "💻",
          "description": "AI tools for software development",
          "sort_order": 1,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "75af7ce1-2dda-40ea-9a7b-9ffa3c1bea1b",
    "slug": "v0-by-vercel",
    "name": "v0 by Vercel",
    "tagline": "Generate UI components with AI from text descriptions",
    "description": "Generate UI components with AI from text descriptions",
    "website_url": "https://v0.dev",
    "source_url": "https://v0.dev",
    "pricing_summary": "$20/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web"
    ],
    "features": [
      "React components",
      "Tailwind CSS",
      "Shadcn/ui",
      "Export to code"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "1",
        "is_primary": true,
        "categories": {
          "id": "1",
          "slug": "coding",
          "name": "Coding",
          "icon": "💻",
          "description": "AI tools for software development",
          "sort_order": 1,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "91da611e-28b0-48e8-a5bf-36553983b1df",
    "slug": "bolt-new",
    "name": "Bolt.new",
    "tagline": "Full-stack web apps from prompts, deployed instantly",
    "description": "Full-stack web apps from prompts, deployed instantly",
    "website_url": "https://bolt.new",
    "source_url": "https://bolt.new",
    "pricing_summary": "$20/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web"
    ],
    "features": [
      "Instant deployment",
      "Full-stack apps",
      "AI debugging",
      "Browser-based IDE"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "1",
        "is_primary": true,
        "categories": {
          "id": "1",
          "slug": "coding",
          "name": "Coding",
          "icon": "💻",
          "description": "AI tools for software development",
          "sort_order": 1,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "612e63df-2c76-45b7-b7e1-b45f4e90274f",
    "slug": "windsurf",
    "name": "Windsurf",
    "tagline": "AI-powered IDE with deep codebase understanding",
    "description": "AI-powered IDE with deep codebase understanding",
    "website_url": "https://codeium.com/windsurf",
    "source_url": "https://codeium.com/windsurf",
    "pricing_summary": "$15/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Desktop"
    ],
    "features": [
      "Cascade AI",
      "Codebase indexing",
      "Multi-file editing",
      "Terminal integration"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "needs_review",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "1",
        "is_primary": true,
        "categories": {
          "id": "1",
          "slug": "coding",
          "name": "Coding",
          "icon": "💻",
          "description": "AI tools for software development",
          "sort_order": 1,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "b90f2b54-b857-4d6f-8fc1-ce701c93cf9e",
    "slug": "jasper-ai",
    "name": "Jasper AI",
    "tagline": "AI content platform for marketing teams",
    "description": "AI content platform for marketing teams",
    "website_url": "https://jasper.ai",
    "source_url": "https://jasper.ai",
    "pricing_summary": "$39/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web",
      "Chrome Extension"
    ],
    "features": [
      "Content generation",
      "Brand voice",
      "Templates",
      "SEO optimization"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "3",
        "is_primary": true,
        "categories": {
          "id": "3",
          "slug": "content",
          "name": "Content",
          "icon": "✍️",
          "description": "AI tools for writing and content",
          "sort_order": 3,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "371ed9b7-e629-456a-b115-cda35a7ce493",
    "slug": "copy-ai",
    "name": "Copy.ai",
    "tagline": "AI copywriting for marketing and sales",
    "description": "AI copywriting for marketing and sales",
    "website_url": "https://copy.ai",
    "source_url": "https://copy.ai",
    "pricing_summary": "$49/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web"
    ],
    "features": [
      "Marketing copy",
      "Email templates",
      "Social media",
      "Product descriptions"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "5",
        "is_primary": true,
        "categories": {
          "id": "5",
          "slug": "marketing",
          "name": "Marketing",
          "icon": "📈",
          "description": "AI tools for marketing",
          "sort_order": 5,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "f8c651fc-73ed-4029-8e0a-2d6654e2a440",
    "slug": "grammarly",
    "name": "Grammarly",
    "tagline": "AI writing assistant for clarity and correctness",
    "description": "AI writing assistant for clarity and correctness",
    "website_url": "https://grammarly.com",
    "source_url": "https://grammarly.com",
    "pricing_summary": "$12/month",
    "pricing_model": "subscription",
    "has_free_tier": true,
    "platforms": [
      "Web",
      "Desktop",
      "Mobile",
      "Browser Extension"
    ],
    "features": [
      "Grammar checking",
      "Tone suggestions",
      "Plagiarism detection",
      "Style guide"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "3",
        "is_primary": true,
        "categories": {
          "id": "3",
          "slug": "content",
          "name": "Content",
          "icon": "✍️",
          "description": "AI tools for writing and content",
          "sort_order": 3,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "16933d95-c741-44a9-93c3-5842283d518f",
    "slug": "notion-ai",
    "name": "Notion AI",
    "tagline": "AI-powered workspace and knowledge management",
    "description": "AI-powered workspace and knowledge management",
    "website_url": "https://notion.so",
    "source_url": "https://notion.so",
    "pricing_summary": "$10/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web",
      "Desktop",
      "Mobile"
    ],
    "features": [
      "Note-taking",
      "AI writing",
      "Database",
      "Collaboration"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "2",
        "is_primary": true,
        "categories": {
          "id": "2",
          "slug": "productivity",
          "name": "Productivity",
          "icon": "⚡",
          "description": "AI tools to boost productivity",
          "sort_order": 2,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "545c8d7e-05c5-4f41-b3ea-ccfb174bbf2f",
    "slug": "canva-ai",
    "name": "Canva AI",
    "tagline": "Design platform with AI-powered features",
    "description": "Design platform with AI-powered features",
    "website_url": "https://canva.com",
    "source_url": "https://canva.com",
    "pricing_summary": "$15/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Web",
      "Mobile"
    ],
    "features": [
      "Template library",
      "AI design",
      "Brand kit",
      "Collaboration"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "4",
        "is_primary": true,
        "categories": {
          "id": "4",
          "slug": "design",
          "name": "Design",
          "icon": "🎨",
          "description": "AI tools for design and creativity",
          "sort_order": 4,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "23a08e01-46ac-4ebc-a03b-29fd7faef2ee",
    "slug": "descript",
    "name": "Descript",
    "tagline": "AI-powered video and podcast editing",
    "description": "AI-powered video and podcast editing",
    "website_url": "https://descript.com",
    "source_url": "https://descript.com",
    "pricing_summary": "$15/month",
    "pricing_model": "subscription",
    "has_free_tier": false,
    "platforms": [
      "Desktop",
      "Web"
    ],
    "features": [
      "Transcription",
      "Voice cloning",
      "Video editing",
      "Screen recording"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "3",
        "is_primary": true,
        "categories": {
          "id": "3",
          "slug": "content",
          "name": "Content",
          "icon": "✍️",
          "description": "AI tools for writing and content",
          "sort_order": 3,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "62282776-834b-47ea-9b7c-a658768ddd49",
    "slug": "gpt-4o",
    "name": "GPT-4o",
    "tagline": "OpenAI's multimodal flagship model",
    "description": "OpenAI's multimodal flagship model",
    "website_url": "https://openai.com/gpt-4",
    "source_url": "https://openai.com/gpt-4",
    "pricing_summary": "Pay-per-use",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "API",
      "ChatGPT"
    ],
    "features": [
      "Text generation",
      "Code",
      "Image analysis",
      "Reasoning"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "needs_review",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "ae8f9b07-5dc0-4989-bcdb-ecb8179179da",
    "slug": "claude-3-5-sonnet",
    "name": "Claude 3.5 Sonnet",
    "tagline": "Anthropic's most capable model",
    "description": "Anthropic's most capable model",
    "website_url": "https://anthropic.com",
    "source_url": "https://anthropic.com",
    "pricing_summary": "Pay-per-use",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "API",
      "Claude.ai"
    ],
    "features": [
      "Analysis",
      "Writing",
      "Code",
      "Long context"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "needs_review",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "d29aff6c-b986-4f7b-8e29-58701fd94135",
    "slug": "gemini-pro",
    "name": "Gemini Pro",
    "tagline": "Google's advanced AI model",
    "description": "Google's advanced AI model",
    "website_url": "https://deepmind.google/technologies/gemini",
    "source_url": "https://deepmind.google/technologies/gemini",
    "pricing_summary": "Pay-per-use",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "API",
      "Gemini"
    ],
    "features": [
      "Multimodal",
      "Reasoning",
      "Code",
      "Search integration"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "7f2ece62-8ccc-4bdc-b927-7f257013276c",
    "slug": "dall-e-3",
    "name": "DALL-E 3",
    "tagline": "OpenAI's image generation model",
    "description": "OpenAI's image generation model",
    "website_url": "https://openai.com/dall-e-3",
    "source_url": "https://openai.com/dall-e-3",
    "pricing_summary": "Pay-per-use",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "API",
      "ChatGPT"
    ],
    "features": [
      "Text-to-image",
      "High quality",
      "Precise prompts"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "needs_review",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "b989b45c-0478-43cb-8627-03f7cdc43aa8",
    "slug": "stable-diffusion-xl",
    "name": "Stable Diffusion XL",
    "tagline": "Open-source image generation",
    "description": "Open-source image generation",
    "website_url": "https://stability.ai",
    "source_url": "https://stability.ai",
    "pricing_summary": "Paid API (open weights)",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "Self-hosted",
      "API"
    ],
    "features": [
      "Text-to-image",
      "Image-to-image",
      "Customizable"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "8a7b2f91-765d-4cf8-b42c-1785ce6b542c",
    "slug": "whisper",
    "name": "Whisper",
    "tagline": "OpenAI's speech recognition system",
    "description": "OpenAI's speech recognition system",
    "website_url": "https://openai.com/research/whisper",
    "source_url": "https://openai.com/research/whisper",
    "pricing_summary": "Pay-per-use",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "API",
      "Self-hosted"
    ],
    "features": [
      "Transcription",
      "Translation",
      "Multi-language"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "59f86acc-79ed-4f3f-a324-710e35b1b95b",
    "slug": "elevenlabs",
    "name": "ElevenLabs",
    "tagline": "AI voice generation and cloning",
    "description": "AI voice generation and cloning",
    "website_url": "https://elevenlabs.io",
    "source_url": "https://elevenlabs.io",
    "pricing_summary": "Freemium",
    "pricing_model": "free",
    "has_free_tier": true,
    "platforms": [
      "API",
      "Web"
    ],
    "features": [
      "Voice synthesis",
      "Voice cloning",
      "Multi-language"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "5aa739d9-b7a5-4e83-944b-c00a8deedd1d",
    "slug": "langchain-agent",
    "name": "LangChain Agent",
    "tagline": "Framework for building AI agents",
    "description": "Framework for building AI agents",
    "website_url": "https://langchain.com",
    "source_url": "https://langchain.com",
    "pricing_summary": "Open-source",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "Python",
      "JavaScript"
    ],
    "features": [
      "Agent orchestration",
      "Tool integration",
      "Memory"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "c082fc44-7ba9-42b8-99ab-3659d3025e70",
    "slug": "autogpt",
    "name": "AutoGPT",
    "tagline": "Autonomous AI agent",
    "description": "Autonomous AI agent",
    "website_url": "https://github.com/Significant-Gravitas/AutoGPT",
    "source_url": "https://github.com/Significant-Gravitas/AutoGPT",
    "pricing_summary": "Open-source",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "Self-hosted"
    ],
    "features": [
      "Task completion",
      "Web browsing",
      "Code execution"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "needs_review",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "1b2ae3b9-0b4a-40aa-9f99-fa72169e9f42",
    "slug": "agentgpt",
    "name": "AgentGPT",
    "tagline": "Browser-based autonomous AI",
    "description": "Browser-based autonomous AI",
    "website_url": "https://agentgpt.reworkd.ai",
    "source_url": "https://agentgpt.reworkd.ai",
    "pricing_summary": "See website",
    "pricing_model": "contact",
    "has_free_tier": false,
    "platforms": [
      "Web"
    ],
    "features": [
      "Goal-oriented",
      "Web access",
      "Task breakdown"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "needs_review",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  },
  {
    "id": "fd502237-6073-4fe1-bdbe-0f30660dc1ac",
    "slug": "replicate",
    "name": "Replicate",
    "tagline": "Platform for running AI models",
    "description": "Platform for running AI models",
    "website_url": "https://replicate.com",
    "source_url": "https://replicate.com",
    "pricing_summary": "Pay-per-use",
    "pricing_model": "pay-per-use",
    "has_free_tier": false,
    "platforms": [
      "API"
    ],
    "features": [
      "Model hosting",
      "API access",
      "Multiple models"
    ],
    "editorial_score": null,
    "editorial_why": null,
    "is_sponsored": false,
    "status": "published",
    "last_verified_at": "2026-10-10T00:00:00Z",
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z",
    "tool_categories": [
      {
        "category_id": "6",
        "is_primary": true,
        "categories": {
          "id": "6",
          "slug": "ai-models",
          "name": "AI Models",
          "icon": "🤖",
          "description": "Foundation models and APIs",
          "sort_order": 6,
          "created_at": "2026-10-10T00:00:00Z",
          "updated_at": "2026-10-10T00:00:00Z"
        }
      }
    ]
  }
];

export const fallbackCategories = [
  {
    "id": "1",
    "slug": "coding",
    "name": "Coding",
    "icon": "💻",
    "description": "AI tools for software development",
    "sort_order": 1,
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z"
  },
  {
    "id": "2",
    "slug": "productivity",
    "name": "Productivity",
    "icon": "⚡",
    "description": "AI tools to boost productivity",
    "sort_order": 2,
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z"
  },
  {
    "id": "3",
    "slug": "content",
    "name": "Content",
    "icon": "✍️",
    "description": "AI tools for writing and content",
    "sort_order": 3,
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z"
  },
  {
    "id": "4",
    "slug": "design",
    "name": "Design",
    "icon": "🎨",
    "description": "AI tools for design and creativity",
    "sort_order": 4,
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z"
  },
  {
    "id": "5",
    "slug": "marketing",
    "name": "Marketing",
    "icon": "📈",
    "description": "AI tools for marketing",
    "sort_order": 5,
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z"
  },
  {
    "id": "6",
    "slug": "ai-models",
    "name": "AI Models",
    "icon": "🤖",
    "description": "Foundation models and APIs",
    "sort_order": 6,
    "created_at": "2026-10-10T00:00:00Z",
    "updated_at": "2026-10-10T00:00:00Z"
  }
];

export const fallbackToolCategories = [
  {
    "tool_id": "5c9e644a-9506-4a30-93c0-ad0af8030dcd",
    "category_id": "2",
    "is_primary": true
  },
  {
    "tool_id": "3d626c74-937e-4a96-870c-07b89a5c7fff",
    "category_id": "2",
    "is_primary": true
  },
  {
    "tool_id": "0750cfda-7e2e-4294-bfbd-4669b601936c",
    "category_id": "4",
    "is_primary": true
  },
  {
    "tool_id": "de3c2b5e-147a-4008-b002-cc597878de2b",
    "category_id": "1",
    "is_primary": true
  },
  {
    "tool_id": "534344ff-cf6a-4e79-9975-732cfc72da97",
    "category_id": "1",
    "is_primary": true
  },
  {
    "tool_id": "3de0ca7c-5b7a-482e-a0d1-98960dc2df03",
    "category_id": "1",
    "is_primary": true
  },
  {
    "tool_id": "75af7ce1-2dda-40ea-9a7b-9ffa3c1bea1b",
    "category_id": "1",
    "is_primary": true
  },
  {
    "tool_id": "91da611e-28b0-48e8-a5bf-36553983b1df",
    "category_id": "1",
    "is_primary": true
  },
  {
    "tool_id": "612e63df-2c76-45b7-b7e1-b45f4e90274f",
    "category_id": "1",
    "is_primary": true
  },
  {
    "tool_id": "b90f2b54-b857-4d6f-8fc1-ce701c93cf9e",
    "category_id": "3",
    "is_primary": true
  },
  {
    "tool_id": "371ed9b7-e629-456a-b115-cda35a7ce493",
    "category_id": "5",
    "is_primary": true
  },
  {
    "tool_id": "f8c651fc-73ed-4029-8e0a-2d6654e2a440",
    "category_id": "3",
    "is_primary": true
  },
  {
    "tool_id": "16933d95-c741-44a9-93c3-5842283d518f",
    "category_id": "2",
    "is_primary": true
  },
  {
    "tool_id": "545c8d7e-05c5-4f41-b3ea-ccfb174bbf2f",
    "category_id": "4",
    "is_primary": true
  },
  {
    "tool_id": "23a08e01-46ac-4ebc-a03b-29fd7faef2ee",
    "category_id": "3",
    "is_primary": true
  },
  {
    "tool_id": "62282776-834b-47ea-9b7c-a658768ddd49",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "ae8f9b07-5dc0-4989-bcdb-ecb8179179da",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "d29aff6c-b986-4f7b-8e29-58701fd94135",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "7f2ece62-8ccc-4bdc-b927-7f257013276c",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "b989b45c-0478-43cb-8627-03f7cdc43aa8",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "8a7b2f91-765d-4cf8-b42c-1785ce6b542c",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "59f86acc-79ed-4f3f-a324-710e35b1b95b",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "5aa739d9-b7a5-4e83-944b-c00a8deedd1d",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "c082fc44-7ba9-42b8-99ab-3659d3025e70",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "1b2ae3b9-0b4a-40aa-9f99-fa72169e9f42",
    "category_id": "6",
    "is_primary": true
  },
  {
    "tool_id": "fd502237-6073-4fe1-bdbe-0f30660dc1ac",
    "category_id": "6",
    "is_primary": true
  }
];
