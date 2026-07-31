import { Profile, Report, SOSAlert, Verification } from '../types';
import { createServiceRoleClient } from './server';

// Profile Queries
export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data as Profile;
}

export async function createOrUpdateProfile(profile: Partial<Profile> & { id: string }): Promise<Profile | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
  if (error) return null;
  return data as Profile;
}

// Report Queries
export async function fetchReports(filters?: {
  report_type?: string;
  status?: string;
  department?: string;
}): Promise<Report[]> {
  const supabase = createServiceRoleClient();
  let query = supabase.from('reports').select('*').order('created_at', { ascending: false });

  if (filters?.report_type && filters.report_type !== 'all') {
    query = query.eq('report_type', filters.report_type);
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.department && filters.department !== 'all') {
    query = query.eq('target_department', filters.department);
  }

  const { data, error } = await query;
  if (error) return [];
  return data as Report[];
}

export async function fetchReportById(id: string): Promise<Report | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('reports').select('*').eq('id', id).single();
  if (error) return null;
  return data as Report;
}

export async function insertReport(report: Partial<Report>): Promise<Report | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('reports').insert([report]).select().single();
  if (error) return null;
  return data as Report;
}

export async function updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('reports')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return data as Report;
}

// Verification Queries
export async function insertVerification(verification: Partial<Verification>): Promise<Verification | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('verifications').insert([verification]).select().single();
  if (error) return null;
  return data as Verification;
}

// SOS Alert Queries
export async function fetchSOSAlerts(): Promise<SOSAlert[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('sos_alerts').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data as SOSAlert[];
}

export async function insertSOSAlert(sos: Partial<SOSAlert>): Promise<SOSAlert | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from('sos_alerts').insert([sos]).select().single();
  if (error) return null;
  return data as SOSAlert;
}

export async function updateSOSAlertStatus(id: string, status: SOSAlert['status']): Promise<SOSAlert | null> {
  const supabase = createServiceRoleClient();
  const updates: Partial<SOSAlert> = { status };
  if (status === 'resolved') updates.resolved_at = new Date().toISOString();

  const { data, error } = await supabase.from('sos_alerts').update(updates).eq('id', id).select().single();
  if (error) return null;
  return data as SOSAlert;
}
