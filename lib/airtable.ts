import Airtable from 'airtable'

// Initialize Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
})

// Base ID - you'll need to replace this with your actual Airtable base ID
const baseId = process.env.AIRTABLE_BASE_ID || 'your_base_id_here'

// Table names and IDs
export const TABLES = {
  TOOLS: 'AI Tools',
  TOOLS_ID: 'tblDa14vnGIAsllvh', // Your AI Tools table ID
  AGENTS: 'AI Agents',
  CATEGORIES: 'Categories',
  PERSONAS: 'User Personas',
  BUDGET_TIERS: 'Budget Tiers',
  FEATURED: 'Featured Tools',
  TESTIMONIALS: 'Testimonials',
  ARTICLES: 'Knowledge Articles'
} as const

// Base instance
export const base = airtable.base(baseId)

// Tool interface for Airtable
export interface AirtableTool {
  id: string
  fields: {
    Name: string
    Description: string
    Category: string[]
    Subcategory: string[]
    Rating: number
    Price: string
    PriceRange: 'free' | 'freemium' | 'paid' | 'enterprise'
    Features: string[]
    Tags: string[]
    Image: string
    AffiliateLink: string
    Popularity: number
    Difficulty: 'beginner' | 'intermediate' | 'advanced'
    UseCase: string[]
    AgentType?: string
    Capabilities?: string[]
    Integrations?: string[]
    PricingModel?: string
    Status: 'active' | 'inactive' | 'coming_soon'
    LastUpdated: string
  }
}

// Utility functions
export const airtableUtils = {
  // Get all tools from Airtable
  async getAllTools(): Promise<AirtableTool[]> {
    try {
      const records = await base(TABLES.TOOLS).select({
        view: 'Grid view',
        sort: [{ field: 'Popularity', direction: 'desc' }]
      }).all()
      
      return records.map(record => ({
        id: record.id,
        fields: record.fields as AirtableTool['fields']
      }))
    } catch (error) {
      console.error('Error fetching tools from Airtable:', error)
      return []
    }
  },

  // Get tools by category
  async getToolsByCategory(category: string): Promise<AirtableTool[]> {
    try {
      const records = await base(TABLES.TOOLS).select({
        filterByFormula: `{Category} = '${category}'`,
        sort: [{ field: 'Popularity', direction: 'desc' }]
      }).all()
      
      return records.map(record => ({
        id: record.id,
        fields: record.fields as AirtableTool['fields']
      }))
    } catch (error) {
      console.error(`Error fetching tools for category ${category}:`, error)
      return []
    }
  },

  // Get featured tools
  async getFeaturedTools(): Promise<AirtableTool[]> {
    try {
      const records = await base(TABLES.FEATURED).select({
        view: 'Grid view',
        sort: [{ field: 'FeaturedOrder', direction: 'asc' }]
      }).all()
      
      return records.map(record => ({
        id: record.id,
        fields: record.fields as AirtableTool['fields']
      }))
    } catch (error) {
      console.error('Error fetching featured tools:', error)
      return []
    }
  },

  // Get tools by persona
  async getToolsByPersona(personaId: string): Promise<AirtableTool[]> {
    try {
      const records = await base(TABLES.TOOLS).select({
        filterByFormula: `{RecommendedForPersonas} = '${personaId}'`,
        sort: [{ field: 'Popularity', direction: 'desc' }]
      }).all()
      
      return records.map(record => ({
        id: record.id,
        fields: record.fields as AirtableTool['fields']
      }))
    } catch (error) {
      console.error(`Error fetching tools for persona ${personaId}:`, error)
      return []
    }
  },

  // Search tools
  async searchTools(query: string): Promise<AirtableTool[]> {
    try {
      const records = await base(TABLES.TOOLS).select({
        filterByFormula: `OR(
          SEARCH('${query.toLowerCase()}', LOWER({Name})) > 0,
          SEARCH('${query.toLowerCase()}', LOWER({Description})) > 0,
          SEARCH('${query.toLowerCase()}', LOWER({Tags})) > 0
        )`,
        sort: [{ field: 'Popularity', direction: 'desc' }]
      }).all()
      
      return records.map(record => ({
        id: record.id,
        fields: record.fields as AirtableTool['fields']
      }))
    } catch (error) {
      console.error(`Error searching tools for query "${query}":`, error)
      return []
    }
  },

  // Get categories
  async getCategories(): Promise<string[]> {
    try {
      const records = await base(TABLES.CATEGORIES).select({
        view: 'Grid view',
        sort: [{ field: 'Name', direction: 'asc' }]
      }).all()
      
      return records.map(record => record.fields.Name as string)
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  },

  // Get personas
  async getPersonas(): Promise<any[]> {
    try {
      const records = await base(TABLES.PERSONAS).select({
        view: 'Grid view'
      }).all()
      
      return records.map(record => ({
        id: record.id,
        fields: record.fields
      }))
    } catch (error) {
      console.error('Error fetching personas:', error)
      return []
    }
  },

  // Add new tool
  async addTool(toolData: Partial<AirtableTool['fields']>): Promise<AirtableTool | null> {
    try {
      const record = await base(TABLES.TOOLS).create([
        {
          fields: toolData
        }
      ])
      
      return {
        id: record[0].id,
        fields: record[0].fields as AirtableTool['fields']
      }
    } catch (error) {
      console.error('Error adding tool:', error)
      return null
    }
  },

  // Update tool
  async updateTool(id: string, updates: Partial<AirtableTool['fields']>): Promise<boolean> {
    try {
      await base(TABLES.TOOLS).update([
        {
          id,
          fields: updates
        }
      ])
      return true
    } catch (error) {
      console.error('Error updating tool:', error)
      return false
    }
  },

  // Delete tool
  async deleteTool(id: string): Promise<boolean> {
    try {
      await base(TABLES.TOOLS).destroy([id])
      return true
    } catch (error) {
      console.error('Error deleting tool:', error)
      return false
    }
  }
}

// Convert Airtable tool to our Tool interface
export function convertAirtableToolToTool(airtableTool: AirtableTool) {
  return {
    id: parseInt(airtableTool.id),
    name: airtableTool.fields.Name,
    description: airtableTool.fields.Description,
    category: airtableTool.fields.Category?.[0] || 'Other',
    subcategory: airtableTool.fields.Subcategory?.[0] || 'General',
    rating: airtableTool.fields.Rating || 0,
    price: airtableTool.fields.Price || 'Free',
    priceRange: airtableTool.fields.PriceRange || 'free',
    features: airtableTool.fields.Features || [],
    tags: airtableTool.fields.Tags || [],
    image: airtableTool.fields.Image || '',
    affiliateLink: airtableTool.fields.AffiliateLink || '',
    popularity: airtableTool.fields.Popularity || 0,
    difficulty: airtableTool.fields.Difficulty || 'intermediate',
    useCase: airtableTool.fields.UseCase || [],
    agentType: airtableTool.fields.AgentType,
    capabilities: airtableTool.fields.Capabilities,
    integrations: airtableTool.fields.Integrations,
    pricingModel: airtableTool.fields.PricingModel
  }
}

export default airtable
