'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserIcon, SparklesIcon, RocketLaunchIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline'
import { Tool } from '@/types'

interface Persona {
  id: string
  name: string
  title: string
  description: string
  interests: string[]
  needs: string[]
  budget: string
  painPoints: string[]
  recommendedTools: string[]
  icon: any
  color: string
  filters: {
    priceRange: string[]
    difficulty: string[]
    categories: string[]
    features: string[]
  }
}

const personas: Persona[] = [
  {
    id: 'tech-savvy-sarah',
    name: 'Tech-Savvy Sarah',
    title: 'AI Innovation Seeker',
    description: 'Always on the cutting edge of technology, Sarah needs tools that keep pace with rapid advancements.',
    interests: ['Latest AI innovations', 'Advanced functionality', 'Integration capabilities', 'Performance optimization'],
    needs: ['Cutting-edge features', 'API integrations', 'Custom workflows', 'Scalable solutions'],
    budget: 'Medium to high - willing to invest in quality',
    painPoints: ['Tools becoming outdated quickly', 'Limited integration options', 'Performance bottlenecks'],
    recommendedTools: ['Claude AI', 'GitHub Copilot', 'Hugging Face', 'Runway ML'],
    icon: RocketLaunchIcon,
    color: 'from-brand-purple to-brand-blue',
    filters: {
      priceRange: ['paid', 'enterprise'],
      difficulty: ['intermediate', 'advanced'],
      categories: ['Code & Development', 'AI Assistant', 'Data & Analytics'],
      features: ['API integrations', 'Advanced features', 'Custom workflows', 'Scalable solutions']
    }
  },
  {
    id: 'startup-steve',
    name: 'Startup Steve',
    title: 'Growth-Focused Founder',
    description: 'Building scalable AI solutions for growing business with strategic, ROI-focused investments.',
    interests: ['Scalable AI solutions', 'ROI optimization', 'Bundle deals', 'Business growth'],
    needs: ['Cost-effective tools', 'Enterprise-level features', 'Scalable solutions', 'Strategic partnerships'],
    budget: 'Limited but strategic spending',
    painPoints: ['Finding affordable enterprise features', 'Budget constraints', 'Scaling challenges'],
    recommendedTools: ['Hugging Face', 'Notion AI', 'ChatGPT Plus', 'Descript'],
    icon: SparklesIcon,
    color: 'from-accent-500 to-brand-orange',
    filters: {
      priceRange: ['freemium', 'paid'],
      difficulty: ['beginner', 'intermediate'],
      categories: ['Productivity', 'AI Assistant', 'Text & Writing'],
      features: ['Team collaboration', 'Scalable solutions', 'Cost-effective', 'Quick setup']
    }
  },
  {
    id: 'corporate-claire',
    name: 'Corporate Claire',
    title: 'Enterprise Security Specialist',
    description: 'Requires enterprise-grade AI solutions with robust security and compliance features.',
    interests: ['Enterprise security', 'Compliance standards', 'Team collaboration', 'ROI justification'],
    needs: ['Security compliance', 'Detailed documentation', 'Team management', 'Audit trails'],
    budget: 'High, but requires clear ROI justification',
    painPoints: ['Meeting corporate security standards', 'Compliance requirements', 'Integration complexity'],
    recommendedTools: ['Claude AI', 'Tableau', 'Notion AI', 'Synthesia'],
    icon: ChartBarIcon,
    color: 'from-brand-blue to-primary-600',
    filters: {
      priceRange: ['paid', 'enterprise'],
      difficulty: ['intermediate', 'advanced'],
      categories: ['Data & Analytics', 'Productivity', 'AI Assistant'],
      features: ['Team collaboration', 'Security features', 'Compliance', 'Enterprise features']
    }
  },
  {
    id: 'freelance-fred',
    name: 'Freelance Fred',
    title: 'Productivity-Focused Freelancer',
    description: 'Seeks AI tools that boost productivity and creativity without requiring technical expertise.',
    interests: ['Productivity tools', 'Creative workflows', 'User-friendly interfaces', 'Quick implementation'],
    needs: ['Easy-to-use tools', 'Flexible pricing', 'Quick setup', 'No technical expertise required'],
    budget: 'Subscription-based preferences, lower price point',
    painPoints: ['Complex tools requiring technical knowledge', 'High upfront costs', 'Steep learning curves'],
    recommendedTools: ['ChatGPT Plus', 'Midjourney', 'Jasper', 'Notion AI'],
    icon: LightBulbIcon,
    color: 'from-brand-orange to-accent-500',
    filters: {
      priceRange: ['free', 'freemium'],
      difficulty: ['beginner'],
      categories: ['AI Assistant', 'Image Generation', 'Text & Writing', 'Productivity'],
      features: ['User-friendly', 'Quick setup', 'Easy to use', 'Creative tools']
    }
  }
]

interface PersonaFilterProps {
  tools: Tool[]
  onFilteredTools: (tools: Tool[]) => void
  selectedPersonaId?: string | null
}

export default function PersonaFilter({ tools, onFilteredTools, selectedPersonaId }: PersonaFilterProps) {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  useEffect(() => {
    if (selectedPersonaId) {
      const persona = personas.find(p => p.id === selectedPersonaId)
      setSelectedPersona(persona || null)
    } else {
      setSelectedPersona(null)
    }
  }, [selectedPersonaId])

  useEffect(() => {
    if (selectedPersona) {
      const filteredTools = tools.filter(tool => {
        const personaFilters = selectedPersona.filters
        
        // Check if tool matches persona's price range preferences
        const matchesPrice = personaFilters.priceRange.includes(tool.priceRange)
        
        // Check if tool matches persona's difficulty preferences
        const matchesDifficulty = personaFilters.difficulty.includes(tool.difficulty)
        
        // Check if tool matches persona's category preferences
        const matchesCategory = personaFilters.categories.includes(tool.category)
        
        // Check if tool has features the persona needs
        const hasNeededFeatures = personaFilters.features.some(feature => 
          tool.features.some(toolFeature => 
            toolFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
        
        return matchesPrice && matchesDifficulty && matchesCategory && hasNeededFeatures
      })
      
      onFilteredTools(filteredTools)
    } else {
      onFilteredTools(tools)
    }
  }, [selectedPersona, tools, onFilteredTools])

  if (!selectedPersona) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-xl p-6 mb-8 border border-brand-purple/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 bg-gradient-to-r ${selectedPersona.color} rounded-full flex items-center justify-center mr-4`}>
            <selectedPersona.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtered for {selectedPersona.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedPersona.title}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setSelectedPersona(null)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear Filter
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedPersona.budget}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Focus:</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedPersona.interests[0]}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Key Need:</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedPersona.needs[0]}</span>
        </div>
      </div>
    </motion.div>
  )
}
