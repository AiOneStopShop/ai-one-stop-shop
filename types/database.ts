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
