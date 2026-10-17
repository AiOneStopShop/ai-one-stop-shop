'use client'

import { useState } from 'react'
import OptionDHeader from '@/components/OptionDHeader'
import OptionDHero from '@/components/OptionDHero'
import SituationPicker from '@/components/SituationPicker'
import BudgetPicker from '@/components/BudgetPicker'
import ToolRecommendation from '@/components/ToolRecommendation'
import HonestySection from '@/components/HonestySection'
import Footer from '@/components/Footer'
import aiTools from '@/data/aiTools'

// Tool recommendation logic based on situation and budget
const getToolRecommendations = (situation: string, budget: string, monthlyLimit: number) => {
  // Define situation-based tool mappings
  const situationMap: Record<string, number[]> = {
    work: [18, 2, 10], // Grammarly, ChatGPT Plus, Canva AI
    business: [10, 19, 14, 18], // Canva AI, Notion AI, Descript, Grammarly
    everyday: [18, 19, 2], // Grammarly, Notion AI, ChatGPT Plus
  }

  const toolIds = situationMap[situation] || situationMap.everyday
  let tools = aiTools.filter((tool) => toolIds.includes(tool.id))

  // Apply budget filter
  if (budget === 'free') {
    tools = tools.filter((tool) => tool.priceRange === 'free' || tool.priceRange === 'freemium')
  } else if (budget === 'limit') {
    // Calculate total within budget
    const filtered: typeof tools = []
    let total = 0
    for (const tool of tools) {
      const price = extractPrice(tool.price)
      if (total + price <= monthlyLimit) {
        filtered.push(tool)
        total += price
      }
    }
    tools = filtered
  } else if (budget === 'help') {
    // Show top 2
    tools = tools.slice(0, 2)
  }

  // Limit to 3 tools max
  return tools.slice(0, 3).map((tool) => ({
    name: tool.name,
    description: tool.description,
    price: tool.price,
    hasFree: tool.priceRange === 'free' || tool.priceRange === 'freemium',
  }))
}

// Extract numeric price from string like "$20/month"
const extractPrice = (priceStr: string): number => {
  const match = priceStr.match(/\$(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export default function Home() {
  const [selectedSituation, setSelectedSituation] = useState('work')
  const [selectedBudget, setSelectedBudget] = useState('free')
  const [monthlyLimit, setMonthlyLimit] = useState(30)
  const [showResults, setShowResults] = useState(false)

  const recommendations = getToolRecommendations(selectedSituation, selectedBudget, monthlyLimit)

  const handleShowResults = () => {
    setShowResults(true)
    // Smooth scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('results')
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <>
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:bg-green focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>
      
      <OptionDHeader />
      
      <main id="main">
        <OptionDHero />
        
        <SituationPicker
          selectedSituation={selectedSituation}
          onSituationChange={(situation) => {
            setSelectedSituation(situation)
            setShowResults(false)
          }}
        />
        
        <BudgetPicker
          selectedBudget={selectedBudget}
          monthlyLimit={monthlyLimit}
          onBudgetChange={(budget) => {
            setSelectedBudget(budget)
            setShowResults(false)
          }}
          onLimitChange={setMonthlyLimit}
          onShowResults={handleShowResults}
        />
        
        <div id="results">
          <ToolRecommendation
            tools={recommendations}
            selectedBudget={selectedBudget}
            show={showResults}
          />
        </div>
        
        <HonestySection />
      </main>
      
      <Footer />
    </>
  )
}
