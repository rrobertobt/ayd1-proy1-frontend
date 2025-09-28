export interface Branch {
  branch_id?: number;
  branch_code: string;
  branch_name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}
