'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import SearchAndFilter from '@/components/SearchAndFilter'
import PersonaFilter from '@/components/PersonaFilter'
import { StarIcon, SparklesIcon, CpuChipIcon, UserGroupIcon, CogIcon } from '@heroicons/react/24/outline'
import { ExternalLink, Zap, Brain, Users, Shield } from 'lucide-react'
import { Tool } from '@/types'

// AI Agents dataset
const aiAgents = [
  {
    id: 1,
    name: 'Claude Sonnet',
    description: 'Advanced reasoning agent for complex problem-solving and analysis',
    category: 'Reasoning Agent',
    subcategory: 'Analysis',
    rating: 4.9,
    price: '$20/month',
    priceRange: 'paid' as const,
    features: ['Advanced reasoning', 'File analysis', 'Code generation', 'Research', 'Writing'],
    tags: ['claude', 'anthropic', 'reasoning', 'analysis'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://claude.ai',
    popularity: 95,
    difficulty: 'intermediate' as const,
    useCase: ['Research', 'Analysis', 'Problem-solving'],
    agentType: 'Autonomous',
    capabilities: ['Text processing', 'File analysis', 'Code generation'],
    integrations: ['API', 'Web interface', 'Mobile app'],
    pricingModel: 'Subscription'
  },
  {
    id: 2,
    name: 'AutoGPT',
    description: 'Autonomous AI agent that can perform tasks independently',
    category: 'Autonomous Agent',
    subcategory: 'Task Automation',
    rating: 4.7,
    price: 'Free - $20/month',
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
    id: 3,
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
    id: 4,
    name: 'AgentGPT',
    description: 'No-code AI agent builder for custom automation workflows',
    category: 'Agent Builder',
    subcategory: 'No-Code',
    rating: 4.5,
    price: 'Free - $29/month',
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
    id: 5,
    name: 'LangChain Agents',
    description: 'Framework for building custom AI agents and applications',
    category: 'Development Framework',
    subcategory: 'Custom Agents',
    rating: 4.8,
    price: 'Free',
    priceRange: 'free' as const,
    features: ['Custom agent development', 'Chain building', 'Memory systems', 'Tool integration'],
    tags: ['langchain', 'framework', 'development', 'custom'],
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://langchain.com',
    popularity: 92,
    difficulty: 'advanced' as const,
    useCase: ['Custom development', 'AI applications', 'Research'],
    agentType: 'Framework',
    capabilities: ['Custom agent creation', 'Chain orchestration', 'Memory management'],
    integrations: ['OpenAI', 'Anthropic', 'Custom models'],
    pricingModel: 'Open Source'
  },
  {
    id: 6,
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
    id: 7,
    name: 'Replicate Agents',
    description: 'Deploy and run AI models as agents in the cloud',
    category: 'Model Deployment',
    subcategory: 'Cloud Agents',
    rating: 4.3,
    price: 'Pay-per-use',
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
  },
  {
    id: 8,
    name: 'Flowise',
    description: 'Drag-and-drop AI agent builder with visual interface',
    category: 'Agent Builder',
    subcategory: 'Visual Builder',
    rating: 4.2,
    price: 'Free - $15/month',
    priceRange: 'freemium' as const,
    features: ['Visual builder', 'Drag-and-drop', 'Custom flows', 'Template library'],
    tags: ['flowise', 'builder', 'visual', 'flows'],
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://flowiseai.com',
    popularity: 75,
    difficulty: 'beginner' as const,
    useCase: ['Visual agent building', 'Custom workflows', 'Prototyping'],
    agentType: 'Builder',
    capabilities: ['Visual flow builder', 'Node-based interface', 'Template system'],
    integrations: ['OpenAI', 'Anthropic', 'Custom APIs'],
    pricingModel: 'Freemium'
  }
]

const categories = ['Reasoning Agent', 'Autonomous Agent', 'Personal Assistant', 'Agent Builder', 'Development Framework', 'Automation Agent', 'Model Deployment']
const subcategories = ['Analysis', 'Task Automation', 'Productivity', 'No-Code', 'Custom Agents', 'Integration', 'Cloud Agents', 'Visual Builder']

export default function AgentsPage() {
  const [filteredAgents, setFilteredAgents] = useState<Tool[]>(aiAgents)
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              AI Agents Directory
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover, deploy, and purchase AI agents that can work autonomously and transform your workflows
            </p>
          </div>
          
          {/* Agent Types Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card text-center"
            >
              <CpuChipIcon className="w-12 h-12 text-brand-purple mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Autonomous Agents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Self-operating AI that can complete tasks independently
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="card text-center"
            >
              <Brain className="w-12 h-12 text-brand-blue mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Reasoning Agents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced AI for complex problem-solving and analysis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="card text-center"
            >
              <CogIcon className="w-12 h-12 text-brand-orange mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Agent Builders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tools to create custom AI agents without coding
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="card text-center"
            >
              <Zap className="w-12 h-12 text-accent-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Automation Agents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered automation for workflows and integrations
              </p>
            </motion.div>
          </div>

          {/* Persona Filter */}
          <PersonaFilter
            tools={aiAgents}
            onFilteredTools={setFilteredAgents}
            selectedPersonaId={selectedPersonaId}
          />

          {/* Search and Filter Component */}
          <SearchAndFilter
            tools={aiAgents}
            onFilteredTools={setFilteredAgents}
            categories={categories}
            subcategories={subcategories}
          />

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative mb-4">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-brand-purple text-white text-xs px-2 py-1 rounded-full">
                      {agent.category}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center bg-white/90 dark:bg-dark-800/90 rounded-full px-2 py-1">
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium ml-1">{agent.rating}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-purple transition-colors">
                  {agent.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {agent.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-neutral-100 dark:bg-dark-700 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {agent.features.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{agent.features.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {agent.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {agent.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                  <span>Type: {agent.agentType}</span>
                  <span>Model: {agent.pricingModel}</span>
                </div>

                <a
                  href={agent.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center group"
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  {agent.priceRange === 'free' ? 'Try Free' : 'Get Started'}
                  <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No AI agents found matching your criteria
              </div>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
