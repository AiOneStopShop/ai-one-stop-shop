export type PricingModel = 'free' | 'freemium' | 'subscription' | 'one-time' | 'usage-based' | 'pay-per-use' | 'contact';
export type ToolStatus = 'draft' | 'published' | 'archived';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  website_url: string;
  pricing_summary: string | null;
  pricing_model: PricingModel | null;
  has_free_tier: boolean;
  platforms: string[];
  features: string[];
  logo_url: string | null;
  editorial_score: number | null;
  editorial_why: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  status: ToolStatus;
  is_sponsored: boolean;
  review_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolWithCategories extends Tool {
  categories: Category[];
  primary_category?: Category;
}

export interface ToolSubmission {
  id: string;
  tool_name: string;
  website_url: string;
  contact_email: string;
  description: string | null;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type LLMPricingCategory = 'api-model' | 'consumer-plan' | 'agent-service' | 'local';

export interface LLMPricing {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: LLMPricingCategory;
  input_price_per_1m: number | null;
  output_price_per_1m: number | null;
  cached_input_price_per_1m: number | null;
  context_window_tokens: number | null;
  monthly_price: number | null;
  has_free_tier: boolean;
  free_tier_note: string | null;
  source_url: string;
  last_checked_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
