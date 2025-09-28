export interface Business {
  business_id?: number;          // PK
  user_id: number;               // NOT NULL UNIQUE en DB (1:1 usuario-comercio)
  current_level_id?: number | null; // FK a loyalty_levels.level_id
  tax_id: string;                // UNIQUE (NIT)
  business_name: string;         // nombre comercial
  legal_name: string;            // razón social
  tax_address: string;           // domicilio fiscal
  business_phone?: string | null;
  business_email?: string | null;
  support_contact?: string | null;
  active: boolean;               // estado
  affiliation_date: string;      // YYYY-MM-DD (DATE)

  created_at?: string;
  updated_at?: string;
}

export interface LoyaltyLevelRef {
  level_id: number;
  level_name: string;
}
