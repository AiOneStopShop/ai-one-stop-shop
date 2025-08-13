'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'
import { ExternalLink, Zap, Brain, Users, Shield, Target, TrendingUp } from 'lucide-react'
import { Tool } from '@/types'

interface BudgetTier {
  id: string
  name: string
  subtitle: string
  budget: number
  description: string
  icon: any
  color: string
  bgGradient: string
  features: string[]
  recommendedTools: string[]
  maxTools: number
  category: 'starter' | 'growth' | 'professional' | 'enterprise'
}

const budgetTiers: BudgetTier[] = [
  {
    id: 'ai-explorer',
    name: 'AI Explorer',
    subtitle: 'Begin Your AI Journey',
    budget: 50,
    description: 'Perfect for individuals and freelancers starting their AI adventure',
    icon: SparklesIcon,
    color: 'text-brand-purple',
    bgGradient: 'from-brand-purple/20 to-brand-blue/20',
    features: [
      'Essential AI tools for productivity',
      'Free and freemium options',
      'Basic automation capabilities',
      'Personal use focused'
    ],
    recommendedTools: ['ChatGPT Plus', 'Hugging Face', 'Notion AI', 'Midjourney'],
    maxTools: 4,
    category: 'starter'
  },
  {
    id: 'ai-innovator',
    name: 'AI Innovator',
    subtitle: 'Scale Your AI Operations',
    budget: 150,
    description: 'Ideal for growing businesses and serious AI enthusiasts',
    icon: RocketLaunchIcon,
    color: 'text-brand-blue',
    bgGradient: 'from-brand-blue/20 to-accent-500/20',
    features: [
      'Advanced AI tools and agents',
      'Team collaboration features',
      'Custom automation workflows',
      'Professional integrations'
    ],
    recommendedTools: ['Claude AI', 'GitHub Copilot', 'AgentGPT', 'Zapier AI', 'Tableau'],
    maxTools: 6,
    category: 'growth'
  },
  {
    id: 'ai-master',
    name: 'AI Master',
    subtitle: 'Enterprise-Grade AI Power',
    budget: 500,
    description: 'For businesses ready to dominate with comprehensive AI solutions',
    icon: Shield,
    color: 'text-brand-orange',
    bgGradient: 'from-brand-orange/20 to-accent-500/20',
    features: [
      'Full AI tool suite access',
      'Enterprise security features',
      'Advanced analytics and insights',
      'Priority support and training'
    ],
    recommendedTools: ['Claude AI', 'AutoGPT', 'LangChain', 'Replicate', 'Synthesia', 'Runway ML', 'Descript'],
    maxTools: 8,
    category: 'professional'
  },
  {
    id: 'ai-legend',
    name: 'AI Legend',
    subtitle: 'Unlimited AI Potential',
    budget: 1000,
    description: 'The ultimate AI toolkit for industry leaders and innovators',
    icon: Target,
    color: 'text-accent-500',
    bgGradient: 'from-accent-500/20 to-brand-purple/20',
    features: [
      'Complete AI ecosystem access',
      'Custom AI agent development',
      'Dedicated AI strategy consulting',
      'Exclusive beta access and features'
    ],
    recommendedTools: ['All Premium Tools', 'Custom Agents', 'Enterprise Solutions', 'Priority Support'],
    maxTools: 12,
    category: 'enterprise'
  }
]

interface BudgetBuilderProps {
  tools: Tool[]
  onToolkitGenerated: (toolkit: Tool[], tier: BudgetTier) => void
}

export default function BudgetBuilder({ tools, onToolkitGenerated }: BudgetBuilderProps) {
  const [selectedTier, setSelectedTier] = useState<BudgetTier | null>(null)
  const [selectedTools, setSelectedTools] = useState<Tool[]>([])
  const [showToolkit, setShowToolkit] = useState(false)

  const availableTools = useMemo(() => {
    if (!selectedTier) return []
    
    // Filter tools based on tier budget and category
    return tools.filter(tool => {
      const toolPrice = getToolPrice(tool.price)
      return toolPrice <= selectedTier.budget && toolPrice > 0
    }).sort((a, b) => b.popularity - a.popularity)
  }, [tools, selectedTier])

  const getToolPrice = (price: string): number => {
    if (price.includes('Free')) return 0
    const match = price.match(/\$(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  const addToToolkit = (tool: Tool) => {
    if (selectedTools.length >= selectedTier!.maxTools) return
    
    const toolPrice = getToolPrice(tool.price)
    const currentTotal = selectedTools.reduce((sum, t) => sum + getToolPrice(t.price), 0)
    
    if (currentTotal + toolPrice <= selectedTier!.budget) {
      setSelectedTools(prev => [...prev, tool])
    }
  }

  const removeFromToolkit = (toolId: number) => {
    setSelectedTools(prev => prev.filter(t => t.id !== toolId))
  }

  const generateToolkit = () => {
    if (selectedTier && selectedTools.length > 0) {
      onToolkitGenerated(selectedTools, selectedTier)
      setShowToolkit(true)
    }
  }

  const toolkitTotal = selectedTools.reduce((sum, tool) => sum + getToolPrice(tool.price), 0)
  const remainingBudget = selectedTier ? selectedTier.budget - toolkitTotal : 0

  return (
    <section className="py-20 bg-gradient-to-br from-neutral-50 to-white dark:from-dark-900 dark:to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Build Your AI Toolkit
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose your budget tier and create the perfect AI toolkit for your needs
          </p>
        </motion.div>

        {/* Budget Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {budgetTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`card cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedTier?.id === tier.id 
                  ? 'ring-2 ring-brand-purple bg-gradient-to-br ' + tier.bgGradient
                  : 'hover:scale-105'
              }`}
              onClick={() => setSelectedTier(tier)}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${tier.bgGradient.replace('/20', '')} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <tier.icon className={`w-8 h-8 ${tier.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {tier.name}
              </h3>
              
              <p className="text-sm font-medium text-brand-purple mb-2">
                {tier.subtitle}
              </p>
              
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ${tier.budget}/month
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {tier.description}
              </p>

              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                {tier.features.slice(0, 2).map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-brand-purple rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="text-xs text-gray-500">
                Up to {tier.maxTools} tools
              </div>
            </motion.div>
          ))}
        </div>

        {selectedTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Available Tools */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Available Tools</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-dark-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-600 transition-colors cursor-pointer"
                    onClick={() => addToToolkit(tool)}
                  >
                    <div className="flex items-center">
                      <img
                        src={tool.image}
                        alt={tool.name}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {tool.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600 dark:text-green-400">
                        {tool.price}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tool.rating} ⭐
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Toolkit */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Your Toolkit</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTools.length}/{selectedTier.maxTools} tools
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Budget: ${selectedTier.budget}</span>
                  <span>Used: ${toolkitTotal}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-brand-purple to-brand-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(toolkitTotal / selectedTier.budget) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ${remainingBudget} remaining
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-3 bg-brand-purple/10 rounded-lg"
                  >
                    <div className="flex items-center">
                      <img
                        src={tool.image}
                        alt={tool.name}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {tool.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.price}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromToolkit(tool.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {selectedTools.length > 0 && (
                <button
                  onClick={generateToolkit}
                  className="btn-primary w-full mt-4"
                >
                  Generate My AI Toolkit
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Generated Toolkit */}
        <AnimatePresence>
          {showToolkit && selectedTier && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12"
            >
              <div className="bg-gradient-to-r from-brand-purple to-brand-blue rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Your {selectedTier.name} Toolkit is Ready!
                </h3>
                <p className="text-xl mb-6 opacity-90">
                  Total Investment: ${toolkitTotal}/month
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-brand-purple font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                    Download Toolkit Guide
                  </button>
                  <button className="border-2 border-white text-white font-medium py-3 px-6 rounded-lg hover:bg-white hover:text-brand-purple transition-colors">
                    Get Implementation Help
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
