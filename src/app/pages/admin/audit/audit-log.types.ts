export interface AuditLogEntry {
  log_id: number;
  user_id: number | null;
  table_name: string;
  operation_type_id: number;
  record_id: number | null;
  old_data: any | null;
  new_data: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string; // ISO
}

export interface AuditQuery {
  tableName?: string;
  userId?: number;
  startDate?: string; // yyyy-mm-dd
  endDate?: string;   // yyyy-mm-dd
}
