'use client'

import { motion } from 'framer-motion'
import { StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ExternalLink } from 'lucide-react'
import { useVisitorTracking } from '@/hooks/useVisitorTracking'

const featuredTools = [
  {
    id: 1,
    name: 'Claude AI',
    description: 'Advanced AI assistant for complex reasoning and analysis',
    category: 'AI Assistant',
    rating: 4.9,
    price: 'Free - $20/month',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://claude.ai',
    features: ['Advanced reasoning', 'File analysis', 'Code generation']
  },
  {
    id: 2,
    name: 'Midjourney',
    description: 'Create stunning AI-generated artwork and illustrations',
    category: 'Image Generation',
    rating: 4.8,
    price: '$10/month',
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://midjourney.com',
    features: ['High-quality art', 'Multiple styles', 'Commercial use']
  },
  {
    id: 3,
    name: 'ChatGPT Plus',
    description: 'Enhanced AI chatbot with advanced capabilities',
    category: 'AI Assistant',
    rating: 4.7,
    price: '$20/month',
    image: 'https://images.unsplash.com/photo-1676299251950-0d7063d5b5c5?w=400&h=300&fit=crop',
    affiliateLink: 'https://chat.openai.com',
    features: ['GPT-4 access', 'Plugins', 'Advanced features']
  },
  {
    id: 4,
    name: 'Notion AI',
    description: 'AI-powered workspace for notes, docs, and collaboration',
    category: 'Productivity',
    rating: 4.6,
    price: '$10/month',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://notion.so',
    features: ['AI writing', 'Task management', 'Team collaboration']
  }
]

export default function FeaturedTools() {
  const { trackToolInteraction } = useVisitorTracking()

  const handleToolClick = (tool: any) => {
    trackToolInteraction(tool.name, 'click', {
      category: tool.category,
      price: tool.price,
      rating: tool.rating,
      source: 'featured_tools'
    })
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured AI Tools
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the most powerful and popular AI tools that are transforming industries
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative mb-4">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-ai-500 text-white text-xs px-2 py-1 rounded-full">
                    {tool.category}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="flex items-center bg-white/90 dark:bg-dark-800/90 rounded-full px-2 py-1">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium ml-1">{tool.rating}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-ai-600 transition-colors">
                {tool.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {tool.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {tool.price}
                </span>
              </div>

              <a
                href={tool.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleToolClick(tool)}
                className="btn-primary w-full flex items-center justify-center group"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Try Now
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
          <a href="/tools" className="btn-secondary">
            View All Tools
          </a>
        </motion.div>
      </div>
    </section>
  )
}
