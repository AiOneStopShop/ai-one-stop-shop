'use client'

import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  MusicalNoteIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const categories = [
  {
    id: 1,
    name: 'AI Assistants',
    description: 'Chatbots and virtual assistants',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-blue-500',
    count: 45
  },
  {
    id: 2,
    name: 'Image Generation',
    description: 'Create stunning visuals with AI',
    icon: PhotoIcon,
    color: 'bg-purple-500',
    count: 32
  },
  {
    id: 3,
    name: 'Text & Writing',
    description: 'Content creation and writing tools',
    icon: DocumentTextIcon,
    color: 'bg-green-500',
    count: 28
  },
  {
    id: 4,
    name: 'Video Creation',
    description: 'AI-powered video generation',
    icon: VideoCameraIcon,
    color: 'bg-red-500',
    count: 18
  },
  {
    id: 5,
    name: 'Code & Development',
    description: 'Programming and development tools',
    icon: CodeBracketIcon,
    color: 'bg-yellow-500',
    count: 25
  },
  {
    id: 6,
    name: 'Audio & Music',
    description: 'AI music and audio generation',
    icon: MusicalNoteIcon,
    color: 'bg-pink-500',
    count: 15
  },
  {
    id: 7,
    name: 'Data & Analytics',
    description: 'AI-powered data analysis',
    icon: ChartBarIcon,
    color: 'bg-indigo-500',
    count: 22
  },
  {
    id: 8,
    name: 'Productivity',
    description: 'Workflow and productivity tools',
    icon: CogIcon,
    color: 'bg-gray-500',
    count: 35
  }
]

export default function Categories() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore AI Categories
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the perfect AI tools for your specific needs across different categories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.count} tools
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Explore category
                </span>
                <div className="w-6 h-6 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center group-hover:bg-ai-100 dark:group-hover:bg-ai-900/20 transition-colors">
                  <svg className="w-3 h-3 text-gray-400 group-hover:text-ai-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
