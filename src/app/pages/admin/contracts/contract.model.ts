export interface Contract {
  contract_id?: number;
  user_id: number;
  admin_id: number;
  contract_type_id: number;
  base_salary?: number | null;
  commission_percentage: number;
  start_date: string;
  end_date?: string | null;
  active: boolean;
  observations?: string | null;
}
export interface ContractTypeRef { contract_type_id: number; type_name: string; }
