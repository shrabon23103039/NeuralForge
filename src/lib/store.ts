import { Report, SOSAlert } from '@/types/database';
import { DEMO_DHAKA_REPORTS } from './seedData';
import { createServiceRoleClient } from './supabase/server';

let memoryReports: Report[] = DEMO_DHAKA_REPORTS.map((r, index) => ({
  id: `rep_${index + 101}`,
  reporter_id: null,
  report_type: r.report_type || 'hazard',
  category: r.category || 'other',
  description: r.description || '',
  photo_url: r.photo_url || null,
  lat: r.lat || 23.75,
  lng: r.lng || 90.38,
  severity: r.severity || 'medium',
  ai_is_valid: r.ai_is_valid ?? true,
  ai_summary_en: r.ai_summary_en || r.description?.slice(0, 50) || null,
  ai_summary_bn: r.ai_summary_bn || null,
  target_department: r.target_department || 'city_corporation',
  status: r.status || 'received',
  duplicate_of: null,
  confirm_count: r.confirm_count || 0,
  dispute_count: r.dispute_count || 0,
  created_at: new Date(Date.now() - index * 3600000).toISOString(),
  updated_at: new Date().toISOString(),
}));

const memorySOSAlerts: SOSAlert[] = [];

export async function getReports(filters?: {
  type?: string;
  status?: string;
  department?: string;
  category?: string;
}): Promise<Report[]> {
  try {
    const supabase = createServiceRoleClient();
    let query = supabase.from('reports').select('*').order('created_at', { ascending: false });

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('report_type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.department && filters.department !== 'all') {
      query = query.eq('target_department', filters.department);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data as Report[];
    }
  } catch (err) {
    console.warn('[Store] Supabase getReports failed, falling back to memory store:', err);
  }

  // Fallback to memory store with filters
  let filtered = [...memoryReports];
  if (filters?.type && filters.type !== 'all') {
    filtered = filtered.filter(r => r.report_type === filters.type);
  }
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(r => r.status === filters.status);
  }
  if (filters?.department && filters.department !== 'all') {
    filtered = filtered.filter(r => r.target_department === filters.department);
  }
  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter(r => r.category === filters.category);
  }

  return filtered;
}

export async function createReport(reportData: Partial<Report>): Promise<Report> {
  const newReport: Report = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    reporter_id: reportData.reporter_id || null,
    report_type: reportData.report_type || 'hazard',
    category: reportData.category || 'other',
    description: reportData.description || '',
    photo_url: reportData.photo_url || null,
    lat: reportData.lat || 23.75,
    lng: reportData.lng || 90.38,
    severity: reportData.severity || 'medium',
    ai_is_valid: reportData.ai_is_valid ?? true,
    ai_summary_en: reportData.ai_summary_en || null,
    ai_summary_bn: reportData.ai_summary_bn || null,
    target_department: reportData.target_department || 'city_corporation',
    status: 'received',
    duplicate_of: null,
    confirm_count: 0,
    dispute_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('reports').insert([newReport]).select().single();
    if (!error && data) {
      memoryReports.unshift(data as Report);
      return data as Report;
    }
  } catch (err) {
    console.warn('[Store] Supabase insert failed, storing in memory store:', err);
  }

  memoryReports.unshift(newReport);
  return newReport;
}

export async function updateReportStatus(id: string, status: Report['status']): Promise<Report | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const idx = memoryReports.findIndex(r => r.id === id);
      if (idx >= 0) memoryReports[idx] = data as Report;
      return data as Report;
    }
  } catch (err) {
    console.warn('[Store] Supabase status update failed, updating memory store:', err);
  }

  const idx = memoryReports.findIndex(r => r.id === id);
  if (idx >= 0) {
    memoryReports[idx].status = status;
    memoryReports[idx].updated_at = new Date().toISOString();
    return memoryReports[idx];
  }

  return null;
}

export async function voteOnReport(id: string, voteType: 'confirm' | 'dispute'): Promise<Report | null> {
  let updatedReport: Report | null = null;
  const idx = memoryReports.findIndex(r => r.id === id);
  if (idx >= 0) {
    if (voteType === 'confirm') memoryReports[idx].confirm_count += 1;
    if (voteType === 'dispute') memoryReports[idx].dispute_count += 1;
    updatedReport = memoryReports[idx];
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: current } = await supabase.from('reports').select('*').eq('id', id).single();
    if (current) {
      const newConfirm = voteType === 'confirm' ? (current.confirm_count || 0) + 1 : current.confirm_count;
      const newDispute = voteType === 'dispute' ? (current.dispute_count || 0) + 1 : current.dispute_count;
      const { data } = await supabase
        .from('reports')
        .update({ confirm_count: newConfirm, dispute_count: newDispute })
        .eq('id', id)
        .select()
        .single();
      if (data) updatedReport = data as Report;
    }
  } catch (err) {
    console.warn('[Store] Supabase vote failed:', err);
  }

  return updatedReport;
}

export async function createSOSAlert(lat: number, lng: number, userId?: string): Promise<SOSAlert> {
  const sos: SOSAlert = {
    id: `sos_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId || null,
    lat,
    lng,
    status: 'active',
    created_at: new Date().toISOString(),
    resolved_at: null,
  };

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('sos_alerts').insert([sos]).select().single();
    if (!error && data) {
      memorySOSAlerts.unshift(data as SOSAlert);
      return data as SOSAlert;
    }
  } catch (err) {
    console.warn('[Store] Supabase SOS insert failed, storing in memory:', err);
  }

  memorySOSAlerts.unshift(sos);
  return sos;
}

export async function getSOSAlerts(): Promise<SOSAlert[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('sos_alerts').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data as SOSAlert[];
    }
  } catch (err) {
    console.warn('[Store] Supabase getSOSAlerts failed:', err);
  }

  return memorySOSAlerts;
}

export async function updateSOSStatus(id: string, status: SOSAlert['status']): Promise<SOSAlert | null> {
  const idx = memorySOSAlerts.findIndex(s => s.id === id);
  if (idx >= 0) {
    memorySOSAlerts[idx].status = status;
    if (status === 'resolved') memorySOSAlerts[idx].resolved_at = new Date().toISOString();
  }

  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from('sos_alerts')
      .update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single();
    if (data) return data as SOSAlert;
  } catch (err) {
    console.warn('[Store] Supabase SOS update status failed:', err);
  }

  return idx >= 0 ? memorySOSAlerts[idx] : null;
}

export async function seedDemoData(): Promise<Report[]> {
  try {
    const supabase = createServiceRoleClient();
    const reportsToInsert = DEMO_DHAKA_REPORTS.map(r => ({
      ...r,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('reports').insert(reportsToInsert).select();
    if (!error && data) {
      memoryReports = data as Report[];
      return data as Report[];
    }
  } catch (err) {
    console.warn('[Store] Seed to Supabase failed, resetting memory store:', err);
  }

  memoryReports = DEMO_DHAKA_REPORTS.map((r, index) => ({
    id: `rep_${index + 101}`,
    reporter_id: null,
    report_type: r.report_type || 'hazard',
    category: r.category || 'other',
    description: r.description || '',
    photo_url: r.photo_url || null,
    lat: r.lat || 23.75,
    lng: r.lng || 90.38,
    severity: r.severity || 'medium',
    ai_is_valid: r.ai_is_valid ?? true,
    ai_summary_en: r.ai_summary_en || r.description?.slice(0, 50) || null,
    ai_summary_bn: r.ai_summary_bn || null,
    target_department: r.target_department || 'city_corporation',
    status: r.status || 'received',
    duplicate_of: null,
    confirm_count: r.confirm_count || 0,
    dispute_count: r.dispute_count || 0,
    created_at: new Date(Date.now() - index * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return memoryReports;
}
