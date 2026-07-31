import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local if available
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0 && !process.env[key]) {
          process.env[key] = valueParts.join('=').trim();
        }
      }
    }
  }
}

loadEnv();

const DEMO_DHAKA_REPORTS = [
  {
    report_type: 'hazard',
    category: 'manhole',
    description: 'Large uncovered manhole on Satmasjid Road near Dhanmondi 27. High risk for pedestrians at night.',
    lat: 23.7508,
    lng: 90.3742,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Open manhole on busy Dhanmondi Satmasjid road.',
    ai_summary_bn: 'ধানমন্ডি ২৭ এ সাতমসজিদ রোডে খোলা ম্যানহোল।',
    target_department: 'city_corporation',
    status: 'received',
    confirm_count: 5,
    dispute_count: 0,
    photo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    report_type: 'crime',
    category: 'snatching',
    description: 'Motorcycle snatchers targeted phone of pedestrian near Farmgate footover bridge at 8:30 PM.',
    lat: 23.7561,
    lng: 90.3872,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Snatching incident near Farmgate overbridge.',
    ai_summary_bn: 'ফার্মগেট ফুটওভার ব্রিজের কাছে মোবাইল ছিনতাই।',
    target_department: 'police',
    status: 'in_progress',
    confirm_count: 8,
    dispute_count: 1,
    photo_url: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'road_damage',
    description: 'Severe potholes and road collapse near Mirpur 10 circle causing daily auto accidents.',
    lat: 23.8069,
    lng: 90.3687,
    severity: 'medium',
    ai_is_valid: true,
    ai_summary_en: 'Major potholes near Mirpur 10 circle.',
    ai_summary_bn: 'মিরপুর ১০ গোলচত্বরের কাছে বড় খানাখন্দ।',
    target_department: 'city_corporation',
    status: 'verified',
    confirm_count: 12,
    dispute_count: 0,
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'fire_risk',
    description: 'Hanging electrical transformer with sparking wires near Gulshan 2 Avenue.',
    lat: 23.7949,
    lng: 90.4143,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Sparking electrical wires in Gulshan 2.',
    ai_summary_bn: 'গুলশান ২ নম্বরে ঝুলন্ত বৈদুতিক তারের স্ফুলিঙ্গ।',
    target_department: 'disaster_management',
    status: 'in_progress',
    confirm_count: 4,
    dispute_count: 0,
    photo_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'drain',
    description: 'Broken slab over open drain near Mohammadpur Town Hall market footpath.',
    lat: 23.7658,
    lng: 90.3624,
    severity: 'medium',
    ai_is_valid: true,
    ai_summary_en: 'Broken drain slab near Mohammadpur Town Hall.',
    ai_summary_bn: 'মোহাম্মদপুর টাউন হল ফুটপাতে ভাঙা ড্রেন।',
    target_department: 'city_corporation',
    status: 'received',
    confirm_count: 3,
    dispute_count: 0,
    created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
  {
    report_type: 'crime',
    category: 'snatching',
    description: 'Bag snatching incident near Uttara Sector 3 Metro Station north entrance.',
    lat: 23.8644,
    lng: 90.3989,
    severity: 'medium',
    ai_is_valid: true,
    ai_summary_en: 'Snatching attempt at Uttara Metro Station.',
    ai_summary_bn: 'উত্তরা মেট্রো স্টেশনের কাছে ব্যাগ ছিনতাই।',
    target_department: 'police',
    status: 'verified',
    confirm_count: 7,
    dispute_count: 0,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    report_type: 'crime',
    category: 'robbery',
    description: 'Armed robbery attempt in dark alley behind Motijheel commercial area bank lane.',
    lat: 23.7330,
    lng: 90.4172,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Armed robbery attempt in Motijheel C/A.',
    ai_summary_bn: 'মতিঝিল বাণিজ্যিক এলাকায় ডাকাতির চেষ্টা।',
    target_department: 'police',
    status: 'received',
    confirm_count: 9,
    dispute_count: 1,
    created_at: new Date(Date.now() - 15 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'manhole',
    description: 'Missing manhole cover in Banani Block 11 street lane.',
    lat: 23.7937,
    lng: 90.4066,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Missing manhole lid in Banani Block 11.',
    ai_summary_bn: 'বনানী ১১ ব্লকে ম্যানহোলের ঢাকনা নেই।',
    target_department: 'city_corporation',
    status: 'resolved',
    confirm_count: 6,
    dispute_count: 0,
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    report_type: 'crime',
    category: 'snatching',
    description: 'Golden chain snatching reported near Shahbagh intersection evening crowd.',
    lat: 23.7388,
    lng: 90.3957,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Chain snatching at Shahbagh intersection.',
    ai_summary_bn: 'শাহবাগ মোড়ে সোনার চেইন ছিনতাই।',
    target_department: 'police',
    status: 'in_progress',
    confirm_count: 11,
    dispute_count: 0,
    created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'road_damage',
    description: 'Road cave-in near Karwan Bazar fish market truck terminal.',
    lat: 23.7516,
    lng: 90.3944,
    severity: 'medium',
    ai_is_valid: true,
    ai_summary_en: 'Road cave-in near Karwan Bazar market.',
    ai_summary_bn: 'কারওয়ান বাজার এলাকায় রাস্তা দেবে গেছে।',
    target_department: 'city_corporation',
    status: 'received',
    confirm_count: 2,
    dispute_count: 0,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'fire_risk',
    description: 'Short circuit fire near Tejgaon Industrial high voltage tower transformer.',
    lat: 23.7640,
    lng: 90.3980,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Electrical line short circuit in Tejgaon.',
    ai_summary_bn: 'তেজগাঁও শিল্পাঞ্চলে বৈদুতিক শর্ট সার্কিট আগুন।',
    target_department: 'disaster_management',
    status: 'received',
    confirm_count: 4,
    dispute_count: 0,
    created_at: new Date(Date.now() - 28 * 3600000).toISOString(),
  },
  {
    report_type: 'crime',
    category: 'snatching',
    description: 'Mobile phone snatched from rickshaw passenger near Agargaon Passport Office road.',
    lat: 23.7770,
    lng: 90.3760,
    severity: 'medium',
    ai_is_valid: true,
    ai_summary_en: 'Rickshaw mobile snatching near Agargaon.',
    ai_summary_bn: 'আগারগাঁও পাসপোর্ট অফিসের কাছে রিকশা থেকে মোবাইল ছিনতাই।',
    target_department: 'police',
    status: 'verified',
    confirm_count: 5,
    dispute_count: 0,
    created_at: new Date(Date.now() - 32 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'drain',
    description: 'Overflowing open sewage drain near Badda Link Road causing severe biohazard.',
    lat: 23.7805,
    lng: 90.4267,
    severity: 'medium',
    ai_is_valid: true,
    ai_summary_en: 'Overflowing sewage drain at Badda Link Road.',
    ai_summary_bn: 'বাড্ডা লিংক রোডে নর্দমার পানি উপচে পড়ছে।',
    target_department: 'city_corporation',
    status: 'in_progress',
    confirm_count: 7,
    dispute_count: 0,
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'manhole',
    description: 'Footpath manhole broken near Shyamoli Square bus stop.',
    lat: 23.7719,
    lng: 90.3631,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Broken manhole near Shyamoli Square.',
    ai_summary_bn: 'শ্যামলী স্কয়ার বাসস্ট্যান্ডে ভাঙা ম্যানহোল।',
    target_department: 'city_corporation',
    status: 'received',
    confirm_count: 3,
    dispute_count: 0,
    created_at: new Date(Date.now() - 40 * 3600000).toISOString(),
  },
  {
    report_type: 'crime',
    category: 'snatching',
    description: 'Pickpocketing and snatching cluster near New Market Gate 1 entry.',
    lat: 23.7333,
    lng: 90.3847,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Snatching cluster at New Market Gate 1.',
    ai_summary_bn: 'নিউ মার্কেট ১ নম্বর গেটে ছিনতাইয়ের ঘটনা।',
    target_department: 'police',
    status: 'in_progress',
    confirm_count: 14,
    dispute_count: 1,
    created_at: new Date(Date.now() - 44 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'road_damage',
    description: 'Large waterlogged trench on Bashundhara Gate access road.',
    lat: 23.8152,
    lng: 90.4255,
    severity: 'medium',
    ai_is_valid: true,
    ai_summary_en: 'Waterlogged trench at Bashundhara Gate.',
    ai_summary_bn: 'বসুন্ধরা গেটে জলাবদ্ধ খানাখন্দ।',
    target_department: 'city_corporation',
    status: 'received',
    confirm_count: 4,
    dispute_count: 0,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'drain',
    description: 'Uncovered storm drain near Azimpur bus stand.',
    lat: 23.7275,
    lng: 90.3855,
    severity: 'low',
    ai_is_valid: true,
    ai_summary_en: 'Open storm drain at Azimpur bus stop.',
    ai_summary_bn: 'আজিমপুর বাসস্ট্যান্ডে খোলা ড্রেন।',
    target_department: 'city_corporation',
    status: 'resolved',
    confirm_count: 2,
    dispute_count: 0,
    created_at: new Date(Date.now() - 52 * 3600000).toISOString(),
  },
  {
    report_type: 'hazard',
    category: 'road_damage',
    description: 'Broken rail crossing road surface at Malibagh level crossing.',
    lat: 23.7470,
    lng: 90.4136,
    severity: 'high',
    ai_is_valid: true,
    ai_summary_en: 'Dangerous road damage at Malibagh rail crossing.',
    ai_summary_bn: 'মালিবাগ রেলগেটে ঝুঁকিপূর্ণ রাস্তা।',
    target_department: 'city_corporation',
    status: 'verified',
    confirm_count: 8,
    dispute_count: 0,
    created_at: new Date(Date.now() - 56 * 3600000).toISOString(),
  },
];

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('placeholder')) {
    console.log(`[Seed Script] Supabase environment variables not configured. ${DEMO_DHAKA_REPORTS.length} demo reports available in memory store.`);
    return;
  }

  try {
    const supabase = createClient(url, key);
    console.log(`[Seed Script] Seeding ${DEMO_DHAKA_REPORTS.length} Dhaka reports to Supabase...`);

    const { data, error } = await supabase.from('reports').upsert(DEMO_DHAKA_REPORTS).select();

    if (error) {
      console.warn('[Seed Script Warning] Supabase insert failed:', error.message);
    } else {
      console.log(`[Seed Script] Successfully seeded ${data?.length || DEMO_DHAKA_REPORTS.length} reports!`);
    }
  } catch (err: any) {
    console.warn('[Seed Script Warning] Execution warning:', err?.message || err);
  }
}

seed();
