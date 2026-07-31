import { Report } from '@/types/database';

export interface AISummaryResult {
  summary_en: string;
  summary_bn: string;
  action_items_en: string[];
  action_items_bn: string[];
}

export async function generateAuthorityBriefing(
  reports: Report[],
  department: string = 'all',
  lang: 'en' | 'bn' = 'en'
): Promise<AISummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  const fallbackResult: AISummaryResult = {
    summary_en: `Currently tracking ${reports.length} active civic reports for ${department.replace('_', ' ')}. High priority items require immediate inspection and city team deployment.`,
    summary_bn: `${department} বিভাগের মোট ${reports.length}টি সক্রিয় রিপোর্ট পর্যবেক্ষণ করা হচ্ছে। উচ্চ ঝুঁকিপূর্ণ ঘটনার জন্য দ্রুত ব্যবস্থা নেওয়া প্রয়োজন।`,
    action_items_en: [
      'Dispatch team to high severity snatching/robbery spots near Farmgate & Mirpur.',
      'Deploy drainage repair crew for open manhole reports in Dhanmondi.',
      'Coordinate with DMP emergency team for night patrol enhancements.',
    ],
    action_items_bn: [
      'ফার্মগেট ও মিরপুরে উচ্চ ঝুঁকিপূর্ণ অপরাধ প্রতিরোধে পুলিশ টহল বৃদ্ধি করুন।',
      'ধানমন্ডি এলাকায় খোলা ম্যানহোল মেরামতে জরুরি টিম প্রেরণ করুন।',
      'রাতের বেলা নিরাপত্তা নিশ্চিতে সমন্বিত ব্যবস্থা গ্রহণ করুন।',
    ],
  };

  if (!apiKey || reports.length === 0) {
    return fallbackResult;
  }

  const reportsSummary = reports.slice(0, 15).map(r => ({
    id: r.id,
    type: r.report_type,
    category: r.category,
    severity: r.severity,
    dept: r.target_department,
    desc: r.description,
    status: r.status,
  }));

  const promptText = `
You are an executive AI assistant for municipal and emergency authorities in Dhaka, Bangladesh.
You are given a list of citizen hazard/crime reports for department: "${department}".
Return ONLY valid JSON matching this schema:
{
  "summary_en": "Executive summary paragraph in English",
  "summary_bn": "Executive summary paragraph in Bangla",
  "action_items_en": ["Action item 1", "Action item 2", "Action item 3"],
  "action_items_bn": ["বাংলা অ্যাকশন আইটেম ১", "বাংলা অ্যাকশন আইটেম ২", "বাংলা অ্যাকশন আইটেম ৩"]
}
Reports data: ${JSON.stringify(reportsSummary)}
`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return fallbackResult;

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return fallbackResult;

    const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson) as AISummaryResult;

    return {
      summary_en: parsed.summary_en || fallbackResult.summary_en,
      summary_bn: parsed.summary_bn || fallbackResult.summary_bn,
      action_items_en: parsed.action_items_en || fallbackResult.action_items_en,
      action_items_bn: parsed.action_items_bn || fallbackResult.action_items_bn,
    };
  } catch (err) {
    console.warn('[AI Summarizer] Failed to generate briefing, using fallback:', err);
    return fallbackResult;
  }
}
