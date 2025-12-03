export type UserRole =
  | 'hq'
  | 'area_manager'
  | 'store_manager'
  | 'staff'
  // eventuali ruoli vecchi già presenti nel tuo enum
  | 'admin'
  | 'user';

export interface Profile {
  id: string;
  organization_id: string;
  store_id: string | null;
  area_id: string | null;
  role: UserRole;
  created_at: string;
}
