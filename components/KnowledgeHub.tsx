'use client'

import { motion } from 'framer-motion'
import { BookOpenIcon, PlayIcon, DocumentTextIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const knowledgeResources = [
  {
    id: 1,
    title: 'Getting Started with AI',
    description: 'A comprehensive guide for beginners to understand AI fundamentals',
    type: 'Guide',
    icon: BookOpenIcon,
    duration: '15 min read',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop'
  },
  {
    id: 2,
    title: 'Prompt Engineering Masterclass',
    description: 'Learn how to write effective prompts for better AI results',
    type: 'Video Course',
    icon: PlayIcon,
    duration: '2 hours',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=200&fit=crop'
  },
  {
    id: 3,
    title: 'AI Business Applications',
    description: 'Real-world examples of AI implementation in business',
    type: 'Case Study',
    icon: DocumentTextIcon,
    duration: '25 min read',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1676299251950-0d7063d5b5c5?w=400&h=200&fit=crop'
  },
  {
    id: 4,
    title: 'AI Ethics & Best Practices',
    description: 'Understanding responsible AI development and usage',
    type: 'Workshop',
    icon: UserGroupIcon,
    duration: '1.5 hours',
    level: 'All Levels',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop'
  }
]

const stats = [
  { label: 'Learning Resources', value: '150+' },
  { label: 'Expert Contributors', value: '25+' },
  { label: 'Hours of Content', value: '500+' },
  { label: 'Active Learners', value: '10K+' }
]

export default function KnowledgeHub() {
  return (
    <section className="py-20 bg-gradient-to-br from-ai-50 to-primary-50 dark:from-dark-900 dark:to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Knowledge Hub
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn from experts, master AI concepts, and stay ahead of the curve with our comprehensive resources
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold brand-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {knowledgeResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="relative mb-4">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-ai-500 text-white text-xs px-2 py-1 rounded-full">
                    {resource.type}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 dark:bg-dark-800/90 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {resource.level}
                  </span>
                </div>
              </div>

              <div className="flex items-center mb-3">
                <resource.icon className="w-5 h-5 text-ai-600 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {resource.duration}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-ai-600 transition-colors">
                {resource.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {resource.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ai-600">
                  Start Learning
                </span>
                <div className="w-6 h-6 bg-ai-100 dark:bg-ai-900/20 rounded-full flex items-center justify-center group-hover:bg-ai-200 dark:group-hover:bg-ai-900/40 transition-colors">
                  <svg className="w-3 h-3 text-ai-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
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
          <a href="/knowledge" className="btn-primary">
            Explore All Resources
          </a>
        </motion.div>
      </div>
    </section>
  )
}
