export interface RoleRef { role_id: number; role_name: string; }

export interface User {
  user_id?: number;
  role_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  address?: string | null;
  national_id?: string | null;
  two_factor_enabled: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  role_name?: string;
}

export type CreateUserPayload = Omit<User, 'user_id' | 'created_at' | 'updated_at' | 'role_name'> & {
  temporary_password: string;
};

export type UpdateUserPayload = {
  user_id: number;
  role_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  address?: string | null;
  national_id?: string | null;
  two_factor_enabled: boolean;
};
