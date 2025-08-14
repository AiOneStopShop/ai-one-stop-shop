'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import BudgetBuilder from '@/components/BudgetBuilder'
import { Tool } from '@/types'

import aiTools from '@/data/aiTools'

// Combined tools and agents dataset
const allTools: Tool[] = [
  // AI Tools
  {
    id: 1,
    name: 'Claude AI',
    description: 'Advanced AI assistant for complex reasoning and analysis',
    category: 'AI Assistant',
    subcategory: 'Chatbot',
    rating: 4.9,
    price: '$20/month',
    priceRange: 'freemium' as const,
    features: ['Advanced reasoning', 'File analysis', 'Code generation', 'Research', 'Writing'],
    tags: ['claude', 'anthropic', 'reasoning', 'analysis'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://claude.ai',
    popularity: 95,
    difficulty: 'intermediate' as const,
    useCase: ['Research', 'Writing', 'Analysis']
  },
  {
    id: 2,
    name: 'ChatGPT Plus',
    description: 'Enhanced AI chatbot with advanced capabilities',
    category: 'AI Assistant',
    subcategory: 'Chatbot',
    rating: 4.7,
    price: '$20/month',
    priceRange: 'paid' as const,
    features: ['GPT-4 access', 'Plugins', 'Advanced features', 'Web browsing'],
    tags: ['chatgpt', 'openai', 'gpt-4', 'chatbot'],
    image: 'https://images.unsplash.com/photo-1676299251950-0d7063d5b5c5?w=400&h=300&fit=crop',
    affiliateLink: 'https://chat.openai.com',
    popularity: 98,
    difficulty: 'beginner' as const,
    useCase: ['Conversation', 'Writing', 'Coding']
  },
  {
    id: 3,
    name: 'Midjourney',
    description: 'Create stunning AI-generated artwork and illustrations',
    category: 'Image Generation',
    subcategory: 'Art',
    rating: 4.8,
    price: '$10/month',
    priceRange: 'paid' as const,
    features: ['High-quality art', 'Multiple styles', 'Commercial use', 'Custom prompts'],
    tags: ['midjourney', 'art', 'image', 'generation'],
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://midjourney.com',
    popularity: 92,
    difficulty: 'intermediate' as const,
    useCase: ['Art', 'Design', 'Marketing']
  },
  {
    id: 4,
    name: 'Notion AI',
    description: 'AI-powered workspace for notes, docs, and collaboration',
    category: 'Productivity',
    subcategory: 'Note-taking',
    rating: 4.6,
    price: '$10/month',
    priceRange: 'paid' as const,
    features: ['AI writing', 'Task management', 'Team collaboration', 'Templates'],
    tags: ['notion', 'productivity', 'notes', 'collaboration'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://notion.so',
    popularity: 85,
    difficulty: 'beginner' as const,
    useCase: ['Productivity', 'Collaboration', 'Documentation']
  },
  {
    id: 5,
    name: 'GitHub Copilot',
    description: 'AI-powered code completion and pair programming',
    category: 'Code & Development',
    subcategory: 'Code Assistant',
    rating: 4.5,
    price: '$10/month',
    priceRange: 'paid' as const,
    features: ['Code completion', 'Pair programming', 'Multiple languages', 'IDE integration'],
    tags: ['github', 'copilot', 'coding', 'development'],
    image: 'https://images.unsplash.com/photo-1676299251950-0d7063d5b5c5?w=400&h=300&fit=crop',
    affiliateLink: 'https://github.com/features/copilot',
    popularity: 90,
    difficulty: 'intermediate' as const,
    useCase: ['Coding', 'Development', 'Programming']
  },
  {
    id: 6,
    name: 'Hugging Face',
    description: 'Open-source AI model platform and community',
    category: 'Code & Development',
    subcategory: 'AI Models',
    rating: 4.7,
    price: 'Free',
    priceRange: 'free' as const,
    features: ['Open-source models', 'Model hosting', 'Datasets', 'Community'],
    tags: ['huggingface', 'open-source', 'models', 'community'],
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://huggingface.co',
    popularity: 88,
    difficulty: 'advanced' as const,
    useCase: ['Research', 'Development', 'AI Models']
  },
  // AI Agents
  {
    id: 7,
    name: 'AutoGPT',
    description: 'Autonomous AI agent that can perform tasks independently',
    category: 'Autonomous Agent',
    subcategory: 'Task Automation',
    rating: 4.7,
    price: '$20/month',
    priceRange: 'freemium' as const,
    features: ['Task automation', 'Web browsing', 'File management', 'Email handling'],
    tags: ['autogpt', 'autonomous', 'automation', 'tasks'],
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://autogpt.net',
    popularity: 88,
    difficulty: 'advanced' as const,
    useCase: ['Automation', 'Research', 'Task management'],
    agentType: 'Autonomous',
    capabilities: ['Web browsing', 'File operations', 'Email automation'],
    integrations: ['Local deployment', 'API', 'Web interface'],
    pricingModel: 'Open Source + Premium'
  },
  {
    id: 8,
    name: 'AgentGPT',
    description: 'No-code AI agent builder for custom automation workflows',
    category: 'Agent Builder',
    subcategory: 'No-Code',
    rating: 4.5,
    price: '$29/month',
    priceRange: 'freemium' as const,
    features: ['No-code builder', 'Custom workflows', 'API integrations', 'Template library'],
    tags: ['agentgpt', 'builder', 'no-code', 'workflows'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://agentgpt.reworkd.ai',
    popularity: 85,
    difficulty: 'beginner' as const,
    useCase: ['Workflow automation', 'Custom agents', 'Business processes'],
    agentType: 'Builder',
    capabilities: ['Visual builder', 'Workflow automation', 'API connections'],
    integrations: ['Zapier', 'Webhooks', 'Custom APIs'],
    pricingModel: 'Freemium'
  },
  {
    id: 9,
    name: 'Jarvis AI',
    description: 'Personal AI assistant for productivity and task management',
    category: 'Personal Assistant',
    subcategory: 'Productivity',
    rating: 4.6,
    price: '$15/month',
    priceRange: 'paid' as const,
    features: ['Task management', 'Calendar integration', 'Email automation', 'Voice commands'],
    tags: ['jarvis', 'assistant', 'productivity', 'voice'],
    image: 'https://images.unsplash.com/photo-1676299251950-0d7063d5b5c5?w=400&h=300&fit=crop',
    affiliateLink: 'https://jarvis.ai',
    popularity: 82,
    difficulty: 'beginner' as const,
    useCase: ['Productivity', 'Task management', 'Personal assistant'],
    agentType: 'Assistant',
    capabilities: ['Voice interaction', 'Calendar management', 'Email handling'],
    integrations: ['Google Calendar', 'Gmail', 'Slack', 'Zoom'],
    pricingModel: 'Subscription'
  },
  {
    id: 10,
    name: 'Zapier AI',
    description: 'AI-powered automation platform for connecting apps and services',
    category: 'Automation Agent',
    subcategory: 'Integration',
    rating: 4.4,
    price: '$20/month',
    priceRange: 'paid' as const,
    features: ['App integration', 'Workflow automation', 'AI-powered actions', 'Custom triggers'],
    tags: ['zapier', 'automation', 'integration', 'workflows'],
    image: 'https://images.unsplash.com/photo-1676299251950-0d7063d5b5c5?w=400&h=300&fit=crop',
    affiliateLink: 'https://zapier.com',
    popularity: 90,
    difficulty: 'intermediate' as const,
    useCase: ['App integration', 'Workflow automation', 'Business processes'],
    agentType: 'Automation',
    capabilities: ['Multi-app integration', 'Workflow automation', 'AI actions'],
    integrations: ['5000+ apps', 'Custom webhooks', 'API connections'],
    pricingModel: 'Subscription'
  },
  {
    id: 11,
    name: 'Tableau',
    description: 'AI-powered data visualization and analytics platform',
    category: 'Data & Analytics',
    subcategory: 'Data Visualization',
    rating: 4.5,
    price: '$70/month',
    priceRange: 'enterprise' as const,
    features: ['Data visualization', 'Business intelligence', 'Real-time analytics', 'AI insights'],
    tags: ['tableau', 'data', 'analytics', 'visualization'],
    image: 'https://images.unsplash.com/photo-1676299251950-0d7063d5b5c5?w=400&h=300&fit=crop',
    affiliateLink: 'https://www.tableau.com',
    popularity: 85,
    difficulty: 'advanced' as const,
    useCase: ['Analytics', 'Business', 'Data']
  },
  {
    id: 12,
    name: 'Replicate',
    description: 'Deploy and run AI models as agents in the cloud',
    category: 'Model Deployment',
    subcategory: 'Cloud Agents',
    rating: 4.3,
    price: '$50/month',
    priceRange: 'paid' as const,
    features: ['Model deployment', 'API endpoints', 'Scalable infrastructure', 'Custom models'],
    tags: ['replicate', 'deployment', 'cloud', 'models'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://replicate.com',
    popularity: 78,
    difficulty: 'intermediate' as const,
    useCase: ['Model deployment', 'API services', 'Scalable AI'],
    agentType: 'Deployment',
    capabilities: ['Model hosting', 'API generation', 'Auto-scaling'],
    integrations: ['GitHub', 'Docker', 'Custom models'],
    pricingModel: 'Pay-per-use'
  }
]

export default function ToolkitPage() {
  const [generatedToolkit, setGeneratedToolkit] = useState<{ tools: Tool[], tier: any } | null>(null)

  const handleToolkitGenerated = (tools: Tool[], tier: any) => {
    setGeneratedToolkit({ tools, tier })
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Build Your AI Toolkit
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your budget tier and create the perfect AI toolkit for your needs. Mix and match tools and agents to maximize your AI potential.
            </p>
          </div>
          
          <BudgetBuilder 
            tools={allTools}
            onToolkitGenerated={handleToolkitGenerated}
          />

          {/* Toolkit Summary */}
          {generatedToolkit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <div className="card">
                <h3 className="text-2xl font-bold mb-6">Your AI Toolkit Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Selected Tools & Agents</h4>
                    <div className="space-y-3">
                      {generatedToolkit.tools.map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-dark-700 rounded-lg">
                          <div className="flex items-center">
                            <img
                              src={tool.image}
                              alt={tool.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                            <div>
                              <h5 className="font-medium">{tool.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{tool.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600 dark:text-green-400">{tool.price}</div>
                            <div className="text-xs text-gray-500">{tool.rating} ⭐</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Investment Breakdown</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Monthly Budget:</span>
                        <span className="font-medium">${generatedToolkit.tier.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tools Investment:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          ${generatedToolkit.tools.reduce((sum, tool) => {
                            const price = tool.price.includes('Free') ? 0 : parseInt(tool.price.match(/\$(\d+)/)?.[1] || '0')
                            return sum + price
                          }, 0)}/month
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining Budget:</span>
                        <span className="font-medium text-brand-purple">
                          ${generatedToolkit.tier.budget - generatedToolkit.tools.reduce((sum, tool) => {
                            const price = tool.price.includes('Free') ? 0 : parseInt(tool.price.match(/\$(\d+)/)?.[1] || '0')
                            return sum + price
                          }, 0)}/month
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-brand-purple/10 rounded-lg">
                      <h5 className="font-semibold mb-2">Next Steps</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Sign up for your selected tools</li>
                        <li>• Download our implementation guide</li>
                        <li>• Schedule a consultation call</li>
                        <li>• Join our community for support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}
