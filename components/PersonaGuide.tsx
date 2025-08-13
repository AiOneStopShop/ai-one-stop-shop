'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserIcon, SparklesIcon, RocketLaunchIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline'

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
    recommendedTools: ['Claude AI', 'GitHub Copilot', 'Hugging Face', 'AutoGPT'],
    icon: RocketLaunchIcon,
    color: 'from-brand-purple to-brand-blue'
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
    recommendedTools: ['ChatGPT Plus', 'Midjourney', 'Jasper', 'Jarvis AI'],
    icon: LightBulbIcon,
    color: 'from-brand-orange to-accent-500'
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
    recommendedTools: ['Claude AI', 'Tableau', 'Notion AI', 'Zapier AI'],
    icon: ChartBarIcon,
    color: 'from-brand-blue to-primary-600'
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
    recommendedTools: ['Hugging Face', 'Notion AI', 'ChatGPT Plus', 'AgentGPT'],
    icon: SparklesIcon,
    color: 'from-accent-500 to-brand-orange'
  }
]

interface PersonaGuideProps {
  onPersonaSelect: (persona: Persona) => void
  selectedPersona?: Persona | null
}

export default function PersonaGuide({ onPersonaSelect, selectedPersona }: PersonaGuideProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null)

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
            Find Your Perfect AI Tools
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tell us about yourself and we'll recommend the best AI tools for your specific needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div
                className={`card cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPersona?.id === persona.id 
                    ? 'ring-2 ring-brand-purple bg-gradient-to-br from-brand-purple/5 to-transparent' 
                    : 'hover:scale-105'
                }`}
                onClick={() => onPersonaSelect(persona)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${persona.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <persona.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {persona.name}
                </h3>
                
                <p className="text-sm font-medium text-brand-purple mb-2">
                  {persona.title}
                </p>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {persona.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {persona.interests.slice(0, 2).map((interest, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-neutral-100 dark:bg-dark-700 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetails(showDetails === persona.id ? null : persona.id)
                  }}
                  className="text-sm text-brand-purple hover:text-brand-blue transition-colors"
                >
                  {showDetails === persona.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Detailed View */}
              <AnimatePresence>
                {showDetails === persona.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="absolute top-full left-0 right-0 z-10 mt-2 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-neutral-200 dark:border-dark-700 p-6"
                  >
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Needs</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {persona.needs.map((need, idx) => (
                            <li key={idx} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-brand-purple rounded-full mr-2"></div>
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Budget</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{persona.budget}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pain Points</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {persona.painPoints.map((point, idx) => (
                            <li key={idx} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-brand-orange rounded-full mr-2"></div>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommended Tools</h4>
                        <div className="flex flex-wrap gap-2">
                          {persona.recommendedTools.map((tool, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {selectedPersona && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-brand-purple to-brand-blue rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Perfect for {selectedPersona.name}!
              </h3>
              <p className="text-xl mb-6 opacity-90">
                We've curated the best AI tools for {selectedPersona.title.toLowerCase()}
              </p>
              <button
                onClick={() => window.location.href = '/tools'}
                className="bg-white text-brand-purple font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Explore Recommended Tools
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
