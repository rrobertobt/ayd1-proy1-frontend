export interface LoyaltyLevelRef {
  level_id: number;
  level_name: string;
}

export interface Business {
  business_id?: number;

  // Commerce data
  tax_id: string;
  business_name: string;
  legal_name: string;
  tax_address: string;
  business_phone?: string | null;
  business_email?: string | null;
  support_contact?: string | null;
  active: boolean;
  affiliation_date: string | null;

  // Loyalty
  current_level_id?: number | null;   // used when reading
  initial_level_id?: number | null;   // used only on create

  // Owner/contact user – required by POST per backend
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address?: string | null;
  national_id?: string | null;

  created_at?: string;
  updated_at?: string;
}
