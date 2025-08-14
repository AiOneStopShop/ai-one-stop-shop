import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      ai_tools: {
        Row: {
          id: number
          name: string
          description: string
          category: string
          subcategory: string
          rating: number
          price: string
          price_range: 'free' | 'freemium' | 'paid' | 'enterprise'
          features: string[]
          tags: string[]
          image: string
          affiliate_link: string
          popularity: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          use_case: string[]
          agent_type?: string
          capabilities?: string[]
          integrations?: string[]
          pricing_model?: string
          status: 'active' | 'inactive' | 'coming_soon'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          category: string
          subcategory: string
          rating?: number
          price?: string
          price_range?: 'free' | 'freemium' | 'paid' | 'enterprise'
          features?: string[]
          tags?: string[]
          image?: string
          affiliate_link?: string
          popularity?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          use_case?: string[]
          agent_type?: string
          capabilities?: string[]
          integrations?: string[]
          pricing_model?: string
          status?: 'active' | 'inactive' | 'coming_soon'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          category?: string
          subcategory?: string
          rating?: number
          price?: string
          price_range?: 'free' | 'freemium' | 'paid' | 'enterprise'
          features?: string[]
          tags?: string[]
          image?: string
          affiliate_link?: string
          popularity?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          use_case?: string[]
          agent_type?: string
          capabilities?: string[]
          integrations?: string[]
          pricing_model?: string
          status?: 'active' | 'inactive' | 'coming_soon'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string
          icon: string
          color: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          icon?: string
          color?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          icon?: string
          color?: string
          sort_order?: number
          created_at?: string
        }
      }
      personas: {
        Row: {
          id: number
          name: string
          description: string
          primary_interest: string
          shopping_behavior: string
          key_needs: string[]
          budget: 'low' | 'medium' | 'high'
          pain_points: string[]
          recommended_tools: string[]
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          primary_interest?: string
          shopping_behavior?: string
          key_needs?: string[]
          budget?: 'low' | 'medium' | 'high'
          pain_points?: string[]
          recommended_tools?: string[]
          icon?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          primary_interest?: string
          shopping_behavior?: string
          key_needs?: string[]
          budget?: 'low' | 'medium' | 'high'
          pain_points?: string[]
          recommended_tools?: string[]
          icon?: string
          color?: string
          created_at?: string
        }
      }
    }
  }
}

// Utility functions
export const supabaseUtils = {
  // Get all tools
  async getAllTools() {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .order('popularity', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get tools by category
  async getToolsByCategory(category: string) {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('category', category)
      .order('popularity', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Search tools
  async searchTools(query: string) {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .order('popularity', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get featured tools
  async getFeaturedTools() {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .gte('popularity', 80)
      .order('popularity', { ascending: false })
      .limit(6)
    
    if (error) throw error
    return data
  },

  // Get tools by persona
  async getToolsByPersona(personaId: string) {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .contains('tags', [personaId])
      .order('popularity', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get personas
  async getPersonas() {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Add new tool
  async addTool(toolData: Database['public']['Tables']['ai_tools']['Insert']) {
    const { data, error } = await supabase
      .from('ai_tools')
      .insert(toolData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update tool
  async updateTool(id: number, updates: Database['public']['Tables']['ai_tools']['Update']) {
    const { data, error } = await supabase
      .from('ai_tools')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete tool
  async deleteTool(id: number) {
    const { error } = await supabase
      .from('ai_tools')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Convert Supabase tool to our Tool interface
export function convertSupabaseToolToTool(supabaseTool: Database['public']['Tables']['ai_tools']['Row']) {
  return {
    id: supabaseTool.id,
    name: supabaseTool.name,
    description: supabaseTool.description,
    category: supabaseTool.category,
    subcategory: supabaseTool.subcategory,
    rating: supabaseTool.rating,
    price: supabaseTool.price,
    priceRange: supabaseTool.price_range,
    features: supabaseTool.features,
    tags: supabaseTool.tags,
    image: supabaseTool.image,
    affiliateLink: supabaseTool.affiliate_link,
    popularity: supabaseTool.popularity,
    difficulty: supabaseTool.difficulty,
    useCase: supabaseTool.use_case,
    agentType: supabaseTool.agent_type,
    capabilities: supabaseTool.capabilities,
    integrations: supabaseTool.integrations,
    pricingModel: supabaseTool.pricing_model
  }
}

export default supabase
