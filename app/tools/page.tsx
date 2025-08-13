'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import SearchAndFilter from '@/components/SearchAndFilter'
import PersonaFilter from '@/components/PersonaFilter'
import { StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ExternalLink } from 'lucide-react'
import { Tool } from '@/types'

// Comprehensive AI tools dataset
const aiTools = [
  {
    id: 1,
    name: 'Claude AI',
    description: 'Advanced AI assistant for complex reasoning and analysis',
    category: 'AI Assistant',
    subcategory: 'Chatbot',
    rating: 4.9,
    price: 'Free - $20/month',
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
    name: 'DALL-E 3',
    description: 'OpenAI\'s advanced image generation model',
    category: 'Image Generation',
    subcategory: 'Art',
    rating: 4.6,
    price: '$20/month',
    priceRange: 'paid' as const,
    features: ['High-quality images', 'Text-to-image', 'Editing', 'Variations'],
    tags: ['dalle', 'openai', 'image', 'generation'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://openai.com/dall-e-3',
    popularity: 88,
    difficulty: 'beginner' as const,
    useCase: ['Art', 'Design', 'Content']
  },
  {
    id: 5,
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
    id: 6,
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
    id: 7,
    name: 'Jasper',
    description: 'AI content creation platform for marketing and business',
    category: 'Text & Writing',
    subcategory: 'Content Creation',
    rating: 4.4,
    price: '$39/month',
    priceRange: 'paid' as const,
    features: ['Content creation', 'Marketing copy', 'SEO optimization', 'Brand voice'],
    tags: ['jasper', 'content', 'marketing', 'writing'],
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://jasper.ai',
    popularity: 82,
    difficulty: 'beginner' as const,
    useCase: ['Marketing', 'Content', 'Business']
  },
  {
    id: 8,
    name: 'Runway ML',
    description: 'AI-powered video editing and generation platform',
    category: 'Video Creation',
    subcategory: 'Video Editing',
    rating: 4.3,
    price: '$15/month',
    priceRange: 'paid' as const,
    features: ['Video editing', 'AI generation', 'Motion graphics', 'Green screen'],
    tags: ['runway', 'video', 'editing', 'generation'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://runwayml.com',
    popularity: 78,
    difficulty: 'advanced' as const,
    useCase: ['Video', 'Editing', 'Creative']
  },
  {
    id: 9,
    name: 'Synthesia',
    description: 'AI video generation with virtual presenters',
    category: 'Video Creation',
    subcategory: 'Video Generation',
    rating: 4.2,
    price: '$30/month',
    priceRange: 'paid' as const,
    features: ['Virtual presenters', 'Text-to-video', 'Custom avatars', 'Multilingual'],
    tags: ['synthesia', 'video', 'presentation', 'avatar'],
    image: 'https://images.unsplash.com/photo-1686191128892-3e87d4d6e8c1?w=400&h=300&fit=crop',
    affiliateLink: 'https://synthesia.io',
    popularity: 75,
    difficulty: 'intermediate' as const,
    useCase: ['Training', 'Marketing', 'Education']
  },
  {
    id: 10,
    name: 'Descript',
    description: 'AI-powered audio and video editing platform',
    category: 'Audio & Music',
    subcategory: 'Audio Editing',
    rating: 4.4,
    price: '$12/month',
    priceRange: 'paid' as const,
    features: ['Audio editing', 'Transcription', 'Voice cloning', 'Podcast tools'],
    tags: ['descript', 'audio', 'editing', 'podcast'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    affiliateLink: 'https://www.descript.com',
    popularity: 80,
    difficulty: 'intermediate' as const,
    useCase: ['Podcasting', 'Audio', 'Content']
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
  }
]

const categories = ['AI Assistant', 'Image Generation', 'Video Creation', 'Text & Writing', 'Code & Development', 'Audio & Music', 'Data & Analytics', 'Productivity']
const subcategories = ['Chatbot', 'Art', 'Video Editing', 'Video Generation', 'Content Creation', 'Code Assistant', 'AI Models', 'Audio Editing', 'Data Visualization', 'Note-taking']

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
