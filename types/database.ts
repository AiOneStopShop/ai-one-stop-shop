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

// Sponsor types
export type SponsorPackage = 'featured_tool' | 'category_spotlight' | 'newsletter';
export type SponsorIntakePackage = SponsorPackage | 'founding_bundle' | 'request' | 'partner_program';
export type PlacementStatus = 'pending' | 'approved' | 'live' | 'ended' | 'declined';
export type SponsorIntakeStatus = 'pending_review' | 'approved' | 'declined' | 'processing';
export type PlacementEventType = 'impression' | 'click';

export interface Sponsor {
  id: string;
  company: string;
  contact_email: string;
  website_url: string | null;
  status: 'active' | 'inactive';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorPlacement {
  id: string;
  sponsor_id: string;
  tool_id: string | null;
  package: SponsorPackage;
  category_id: string | null;
  issue_id: string | null;
  blurb: string | null;
  logo_url: string | null;
  link_url: string;
  starts_at: string;
  ends_at: string;
  status: PlacementStatus;
  price_cents: number;
  stripe_payment_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorIntake {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  tool_name: string;
  tool_url: string;
  package: SponsorIntakePackage;
  preferred_start_date: string | null;
  category_slug: string | null;
  blurb: string | null;
  logo_url: string | null;
  logo_file_path: string | null;
  destination_url: string | null;
  targets_children: boolean;
  agreed_to_terms: boolean;
  agreed_to_rights: boolean;
  status: SponsorIntakeStatus;
  decline_reason: string | null;
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlacementEvent {
  id: string;
  placement_id: string;
  event_type: PlacementEventType;
  day: string;
  count: number;
  created_at: string;
  updated_at: string;
}

export interface PublicLivePlacement {
  id: string;
  tool_id: string | null;
  package: SponsorPackage;
  category_id: string | null;
  blurb: string | null;
  logo_url: string | null;
  link_url: string;
  starts_at: string;
  ends_at: string;
  company: string;
}
