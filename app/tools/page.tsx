'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import SearchAndFilter from '@/components/SearchAndFilter'
import PersonaFilter from '@/components/PersonaFilter'
import { StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ExternalLink } from 'lucide-react'
import { Tool } from '@/types'
import aiTools from '@/data/aiTools'

const categories = ['AI Assistant', 'Image Generation', 'Video Creation', 'Text & Writing', 'Code & Development', 'Audio & Music', 'Data & Analytics', 'Productivity']
const subcategories = ['Chatbot', 'Search', 'Personal', 'Art', 'Open Source', 'Design', 'Video Editing', 'Video Generation', 'Content Creation', 'Copywriting', 'Writing Assistant', 'Code Assistant', 'AI Models', 'IDE', 'Music Generation', 'Voice Generation', 'Data Visualization', 'Business Intelligence', 'Product Analytics', 'Data Extraction', 'Note-taking', 'Project Management']

export default function ToolsPage() {
  const [filteredTools, setFilteredTools] = useState<Tool[]>(aiTools)
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              AI Tools Directory
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover and explore hundreds of AI tools across all categories. Find the perfect solution for your needs.
            </p>
          </div>
          
          {/* Persona Filter */}
          <PersonaFilter
            tools={aiTools}
            onFilteredTools={setFilteredTools}
            selectedPersonaId={selectedPersonaId}
          />
          
          {/* Search and Filter Component */}
          <SearchAndFilter
            tools={aiTools}
            onFilteredTools={setFilteredTools}
            categories={categories}
            subcategories={subcategories}
          />
          
          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative mb-4">
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-brand-purple text-white text-xs px-2 py-1 rounded-full">
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
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-purple transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {tool.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {tool.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {tool.features.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{tool.features.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {tool.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {tool.difficulty}
                  </span>
                </div>
                
                <a
                  href={tool.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center group"
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Try Now
                  <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </div>
          
          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No tools found matching your criteria
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
