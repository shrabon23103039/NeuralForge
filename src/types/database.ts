export type UserRole = 'citizen' | 'authority';
export type Department = 'city_corporation' | 'disaster_management' | 'police';
export type ReportType = 'crime' | 'hazard';
export type Category = 'robbery' | 'snatching' | 'manhole' | 'road_damage' | 'drain' | 'fire_risk' | 'other';
export type Severity = 'low' | 'medium' | 'high';
export type Status = 'received' | 'verified' | 'in_progress' | 'resolved' | 'rejected';
export type SOSStatus = 'active' | 'acknowledged' | 'resolved';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  department: Department | null;
  trust_score: number;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  report_type: ReportType;
  category: Category;
  description: string;
  photo_url: string | null;
  lat: number;
  lng: number;
  location?: unknown;
  severity: Severity;
  ai_is_valid: boolean;
  ai_summary_en: string | null;
  ai_summary_bn: string | null;
  target_department: Department;
  status: Status;
  duplicate_of: string | null;
  confirm_count: number;
  dispute_count: number;
  created_at: string;
  updated_at: string;
}

export interface Verification {
  id: string;
  report_id: string;
  user_id: string;
  vote_type: 'confirm' | 'dispute';
  created_at: string;
}

export interface SOSAlert {
  id: string;
  user_id: string | null;
  lat: number;
  lng: number;
  status: SOSStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface HotspotCell {
  id: string;
  cell_lat: number;
  cell_lng: number;
  risk_score: number;
  report_count: number;
  top_category: Category;
  caption_en?: string;
  caption_bn?: string;
}

export interface AIClassificationResult {
  is_valid_report: boolean;
  category: Category;
  severity: Severity;
  target_department: Department;
  summary_en: string;
  summary_bn: string;
}
