import { AIClassificationResult, Category, Department, Severity } from '@/types/database';

export function fallbackClassifier(
  description: string,
  userCategory?: string
): AIClassificationResult {
  const descLower = description.toLowerCase();
  let category: Category = 'other';
  let severity: Severity = 'medium';
  let target_department: Department = 'city_corporation';

  if (
    descLower.includes('snatch') ||
    descLower.includes('mugging') ||
    descLower.includes('robbery') ||
    descLower.includes('thief') ||
    descLower.includes('stole') ||
    descLower.includes('gun') ||
    descLower.includes('knife') ||
    userCategory === 'snatching' ||
    userCategory === 'robbery'
  ) {
    category = descLower.includes('robbery') ? 'robbery' : 'snatching';
    target_department = 'police';
    severity = descLower.includes('gun') || descLower.includes('robbery') ? 'high' : 'medium';
  } else if (
    descLower.includes('manhole') ||
    descLower.includes('hole') ||
    userCategory === 'manhole'
  ) {
    category = 'manhole';
    target_department = 'city_corporation';
    severity = 'high';
  } else if (
    descLower.includes('fire') ||
    descLower.includes('blast') ||
    descLower.includes('electric') ||
    descLower.includes('transformer') ||
    descLower.includes('flood') ||
    userCategory === 'fire_risk'
  ) {
    category = 'fire_risk';
    target_department = 'disaster_management';
    severity = 'high';
  } else if (
    descLower.includes('drain') ||
    descLower.includes('sewer') ||
    userCategory === 'drain'
  ) {
    category = 'drain';
    target_department = 'city_corporation';
    severity = 'medium';
  } else if (
    descLower.includes('road') ||
    descLower.includes('pothole') ||
    userCategory === 'road_damage'
  ) {
    category = 'road_damage';
    target_department = 'city_corporation';
    severity = 'low';
  }

  const shortDesc = description.slice(0, 80);

  return {
    is_valid_report: true,
    category,
    severity,
    target_department,
    summary_en: `Reported ${category.replace('_', ' ')} incident: ${shortDesc}`,
    summary_bn: `রিপোর্টকৃত ঘটনা (${category}): ${shortDesc}`,
  };
}

export async function classifyReport(
  description: string,
  userCategory?: string,
  photoBase64?: string,
  mimeType: string = 'image/jpeg'
): Promise<AIClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[AI Classifier] GEMINI_API_KEY not found, using rule-based fallback');
    return fallbackClassifier(description, userCategory);
  }

  const promptText = `
You are a public-safety triage assistant for a civic-reporting app in Dhaka, Bangladesh.
You are given a photo and a citizen's text description of a hazard or crime location.
Return ONLY valid JSON, no markdown, in this exact schema:
{
  "is_valid_report": boolean,
  "category": "robbery" | "snatching" | "manhole" | "road_damage" | "drain" | "fire_risk" | "other",
  "severity": "low" | "medium" | "high",
  "target_department": "city_corporation" | "disaster_management" | "police",
  "summary_en": string (<= 25 words),
  "summary_bn": string (<= 25 words, in Bangla)
}
Routing rules: manholes/road damage/drains -> city_corporation, unless severity is
high with immediate injury risk -> disaster_management. Robbery/snatching/crime -> police.
If the photo does not clearly show a real hazard (blurry, unrelated, meme, duplicate
stock image), set is_valid_report to false.

Citizen description: "${description}"
Category selected by user: "${userCategory || 'other'}"
`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const contentsParts: Array<Record<string, unknown>> = [
      { text: promptText }
    ];

    if (photoBase64) {
      contentsParts.push({
        inlineData: {
          mimeType,
          data: photoBase64,
        },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: contentsParts }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI Classifier] Gemini API returned status ${response.status}`);
      return fallbackClassifier(description, userCategory);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return fallbackClassifier(description, userCategory);
    }

    // Clean JSON response (strip ```json wrapper if present)
    const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson) as AIClassificationResult;

    return {
      is_valid_report: parsed.is_valid_report ?? true,
      category: parsed.category || (userCategory as Category) || 'other',
      severity: parsed.severity || 'medium',
      target_department: parsed.target_department || 'city_corporation',
      summary_en: parsed.summary_en || description.slice(0, 80),
      summary_bn: parsed.summary_bn || description.slice(0, 80),
    };
  } catch (err) {
    console.warn('[AI Classifier] Gemini classification failed or timed out:', err);
    return fallbackClassifier(description, userCategory);
  }
}
