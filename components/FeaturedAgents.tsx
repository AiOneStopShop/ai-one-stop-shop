'use client'

import { motion } from 'framer-motion'
import { StarIcon, SparklesIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { ExternalLink, Brain, Zap } from 'lucide-react'

const featuredAgents = [
  {
    id: 1,
    name: 'Claude Sonnet',
    description: 'Advanced reasoning agent for complex problem-solving and analysis',
    category: 'Reasoning Agent',
    rating: 4.9,
    price: '$20/month',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://claude.ai',
    features: ['Advanced reasoning', 'File analysis', 'Code generation'],
    agentType: 'Autonomous',
    icon: Brain
  },
  {
    id: 2,
    name: 'AutoGPT',
    description: 'Autonomous AI agent that can perform tasks independently',
    category: 'Autonomous Agent',
    rating: 4.7,
    price: 'Free - $20/month',
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://autogpt.net',
    features: ['Task automation', 'Web browsing', 'File management'],
    agentType: 'Autonomous',
    icon: CpuChipIcon
  },
  {
    id: 3,
    name: 'AgentGPT',
    description: 'No-code AI agent builder for custom automation workflows',
    category: 'Agent Builder',
    rating: 4.5,
    price: 'Free - $29/month',
    image: 'https://images.unsplash.com/photo-1676299251950-0d7063d5b5c5?w=400&h=300&fit=crop',
    affiliateLink: 'https://agentgpt.reworkd.ai',
    features: ['No-code builder', 'Custom workflows', 'API integrations'],
    agentType: 'Builder',
    icon: Zap
  },
  {
    id: 4,
    name: 'Jarvis AI',
    description: 'Personal AI assistant for productivity and task management',
    category: 'Personal Assistant',
    rating: 4.6,
    price: '$15/month',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://jarvis.ai',
    features: ['Task management', 'Calendar integration', 'Voice commands'],
    agentType: 'Assistant',
    icon: SparklesIcon
  }
]

export default function FeaturedAgents() {
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
            Featured AI Agents
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover autonomous AI agents that can work independently and transform your workflows
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
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

              <div className="flex items-center mb-3">
                <agent.icon className="w-5 h-5 text-brand-purple mr-2" />
                <span className="text-xs text-gray-500">{agent.agentType}</span>
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-purple transition-colors">
                {agent.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {agent.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {agent.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-neutral-100 dark:bg-dark-700 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {agent.price}
                </span>
              </div>

              <a
                href={agent.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center group"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Try Agent
                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a href="/agents" className="btn-secondary">
            Explore All AI Agents
          </a>
        </motion.div>
      </div>
    </section>
  )
}
