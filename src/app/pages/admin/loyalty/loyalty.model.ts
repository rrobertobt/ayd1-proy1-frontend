export interface LoyaltyLevel {
  level_id?: number;
  level_name: string;
  min_deliveries: number;
  max_deliveries?: number | null;
  discount_percentage: number;
  free_cancellations: number;
  penalty_percentage: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}
