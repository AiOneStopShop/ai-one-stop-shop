export interface Tool {
  id: number
  name: string
  description: string
  category: string
  subcategory: string
  rating: number
  price: string
  priceRange: 'free' | 'freemium' | 'paid' | 'enterprise'
  features: string[]
  tags: string[]
  image: string
  affiliateLink: string
  popularity: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  useCase: string[]
  agentType?: string
  capabilities?: string[]
  integrations?: string[]
  pricingModel?: string
}
