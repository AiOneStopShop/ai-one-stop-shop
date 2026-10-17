'use client'

import { motion } from 'framer-motion'

interface Tool {
  name: string
  description: string
  price: string
  hasFree: boolean
}

interface ToolRecommendationProps {
  tools: Tool[]
  selectedBudget: string
  show: boolean
}

export default function ToolRecommendation({ tools, selectedBudget, show }: ToolRecommendationProps) {
  if (!show) return null

  const getHeading = () => {
    switch (selectedBudget) {
      case 'free':
        return tools.length > 0 && tools.some(t => !t.hasFree) 
          ? 'Good places to start (paid options)'
          : 'Free places to start'
      case 'help':
        return 'Two good places to start'
      default:
        return 'A start that fits your budget'
    }
  }

  const getDescription = () => {
    if (selectedBudget === 'free' && tools.length > 0 && tools.some(t => !t.hasFree)) {
      return 'These tools offer the most value for beginners. Many have free trials you can start with.'
    }
    if (selectedBudget === 'help') {
      return 'Try the first one for a week on a real task. If it saves you time, keep it.'
    }
    return 'Start with one. Add another only if it helps.'
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-cream pb-16"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="bg-cardBg border-2 border-line rounded-2xl p-6 sm:p-8 max-w-3xl">
          <h3 className="font-serif font-bold text-green text-2xl sm:text-3xl mb-2">
            {getHeading()}
          </h3>
          <p className="text-soft mb-6">{getDescription()}</p>

          {tools.length > 0 ? (
            <>
              <ul className="space-y-4">
                {tools.map((tool, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 py-4 border-t border-dashed border-line first:border-t-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink text-lg mb-1">{tool.name}</div>
                      <div className="text-soft text-sm sm:text-base">{tool.description}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-bold text-ink whitespace-nowrap">
                        {tool.hasFree ? 'Free plan' : tool.price}
                      </div>
                      <div className="text-soft text-sm mt-1">
                        {tool.hasFree ? `paid from ${tool.price}` : 'free plan not listed'}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <p className="text-soft text-sm mt-6 pt-4 border-t border-line">
                Prices as listed on each tool's site, checked Oct 10, 2026. Example picks; final suggestions come from our editors.
              </p>
            </>
          ) : (
            <p className="text-soft">
              No free picks for this yet. Try "Set my budget".
            </p>
          )}
        </div>
      </div>
    </motion.section>
  )
}
