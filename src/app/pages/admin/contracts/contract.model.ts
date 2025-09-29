export interface Contract {
  contract_id?: number;
  user_id: number;
  contract_type_id: number;
  base_salary?: number | null;
  commission_percentage: number;
  start_date: string;          // yyyy-mm-dd
  end_date?: string | null;    // null = open
  observations?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContractTypeRef {
  contract_type_id: number;
  type_name: string;
}
