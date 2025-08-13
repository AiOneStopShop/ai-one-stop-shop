'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { Tool } from '@/types'

interface SearchAndFilterProps {
  tools: Tool[]
  onFilteredTools: (tools: Tool[]) => void
  categories: string[]
  subcategories: string[]
}

export default function SearchAndFilter({ tools, onFilteredTools, categories, subcategories }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedRating, setSelectedRating] = useState(0)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'popularity' | 'price'>('popularity')

  // Get unique features from all tools
  const allFeatures = useMemo(() => {
    const features = new Set<string>()
    tools.forEach(tool => {
      tool.features.forEach(feature => features.add(feature))
    })
    return Array.from(features).sort()
  }, [tools])

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = tools.filter(tool => {
      // Search query
      const matchesSearch = searchQuery === '' || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory

      // Subcategory filter
      const matchesSubcategory = selectedSubcategory === 'all' || tool.subcategory === selectedSubcategory

      // Price range filter
      const matchesPrice = selectedPriceRange === 'all' || tool.priceRange === selectedPriceRange

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' || tool.difficulty === selectedDifficulty

      // Rating filter
      const matchesRating = selectedRating === 0 || tool.rating >= selectedRating

      // Features filter
      const matchesFeatures = selectedFeatures.length === 0 || 
        selectedFeatures.every(feature => tool.features.includes(feature))

      return matchesSearch && matchesCategory && matchesSubcategory && 
             matchesPrice && matchesDifficulty && matchesRating && matchesFeatures
    })

    // Sort tools
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return b.rating - a.rating
        case 'popularity':
          return b.popularity - a.popularity
        case 'price':
          return a.price.localeCompare(b.price)
        default:
          return 0
      }
    })

    return filtered
  }, [tools, searchQuery, selectedCategory, selectedSubcategory, selectedPriceRange, 
      selectedDifficulty, selectedRating, selectedFeatures, sortBy])

  // Update parent component
  useMemo(() => {
    onFilteredTools(filteredTools)
  }, [filteredTools, onFilteredTools])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedSubcategory('all')
    setSelectedPriceRange('all')
    setSelectedDifficulty('all')
    setSelectedRating(0)
    setSelectedFeatures([])
    setSortBy('popularity')
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== 'all',
    selectedSubcategory !== 'all',
    selectedPriceRange !== 'all',
    selectedDifficulty !== 'all',
    selectedRating > 0,
    selectedFeatures.length > 0
  ].filter(Boolean).length

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
            type="text"
            placeholder="Search AI tools, features, or use cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
          />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Toggle and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-brand-purple text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {filteredTools.length} of {tools.length} tools found
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-dark-700 pt-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Subcategories</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                      selectedRating >= rating
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-400'
                    }`}
                  >
                    <StarIcon className="w-4 h-4 fill-current" />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>

            {/* Features Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features
              </label>
              <div className="flex flex-wrap gap-2">
                {allFeatures.slice(0, 10).map(feature => (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedFeatures.includes(feature)
                        ? 'bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20 dark:text-brand-purple'
                        : 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
