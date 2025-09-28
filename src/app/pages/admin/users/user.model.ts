export interface User {
  user_id?: number;
  role_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  address?: string | null;
  national_id?: string | null;
  active: boolean;
  two_factor_enabled: boolean;
}
export interface RoleRef { role_id: number; role_name: string; }
