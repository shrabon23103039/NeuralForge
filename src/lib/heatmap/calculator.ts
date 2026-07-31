import { HotspotCell, Report } from '@/types/database';

export function calculateHeatmapHotspots(reports: Report[]): HotspotCell[] {
  // Grid size approximately 150m in lat/lng degrees (~0.00135)
  const GRID_SIZE = 0.00135;
  const gridMap = new Map<string, {
    latSum: number;
    lngSum: number;
    count: number;
    totalRiskScore: number;
    categories: Record<string, number>;
  }>();

  const categoryWeights: Record<string, number> = {
    robbery: 3.5,
    snatching: 3.0,
    fire_risk: 2.8,
    manhole: 2.2,
    drain: 1.8,
    road_damage: 1.2,
    other: 1.0,
  };

  const severityMultipliers: Record<string, number> = {
    high: 2.0,
    medium: 1.3,
    low: 0.8,
  };

  const now = new Date().getTime();

  for (const report of reports) {
    if (!report.lat || !report.lng) continue;

    // Round lat/lng to grid key
    const gridLatKey = Math.floor(report.lat / GRID_SIZE);
    const gridLngKey = Math.floor(report.lng / GRID_SIZE);
    const key = `${gridLatKey}_${gridLngKey}`;

    // Compute recency decay: e^(-days_since/30)
    const reportTime = new Date(report.created_at || now).getTime();
    const daysSince = Math.max(0, (now - reportTime) / (1000 * 60 * 60 * 24));
    const recencyDecay = Math.exp(-daysSince / 30);

    const catWeight = categoryWeights[report.category] || 1.0;
    const sevMultiplier = severityMultipliers[report.severity] || 1.0;
    const reportScore = catWeight * sevMultiplier * recencyDecay;

    const cell = gridMap.get(key) || {
      latSum: 0,
      lngSum: 0,
      count: 0,
      totalRiskScore: 0,
      categories: {},
    };

    cell.latSum += report.lat;
    cell.lngSum += report.lng;
    cell.count += 1;
    cell.totalRiskScore += reportScore;
    cell.categories[report.category] = (cell.categories[report.category] || 0) + 1;

    gridMap.set(key, cell);
  }

  const result: HotspotCell[] = [];
  let cellId = 1;

  gridMap.forEach((cell) => {
    const avgLat = cell.latSum / cell.count;
    const avgLng = cell.lngSum / cell.count;

    // Find top category
    let topCat = 'other';
    let maxCatCount = 0;
    Object.entries(cell.categories).forEach(([cat, cCount]) => {
      if (cCount > maxCatCount) {
        maxCatCount = cCount;
        topCat = cat;
      }
    });

    const normalizedRiskScore = Math.min(100, Math.round(cell.totalRiskScore * 12));

    let captionEn = `${cell.count} active hazard reports recorded in this area.`;
    let captionBn = `এই এলাকায় ${cell.count}টি সক্রিয় সঙ্কেত পাওয়া গেছে।`;

    if (topCat === 'snatching' || topCat === 'robbery') {
      captionEn = `High safety alert: ${cell.count} incident reports recorded here. Be cautious after evening.`;
      captionBn = `উচ্চ নিরাপত্তা সঙ্কেত: এই এলাকায় ${cell.count}টি অপরাধের রিপোর্ট করা হয়েছে। রাতে চলাচলে সতর্ক থাকুন।`;
    } else if (topCat === 'manhole' || topCat === 'drain') {
      captionEn = `Infrastructure warning: ${cell.count} open manhole/drain hazards reported.`;
      captionBn = `অবকাঠামো সঙ্কেত: এই এলাকায় ${cell.count}টি খোলা ম্যানহোল বা ড্রেনের ঝুঁকি রয়েছে।`;
    }

    result.push({
      id: `cell_${cellId++}`,
      cell_lat: avgLat,
      cell_lng: avgLng,
      risk_score: normalizedRiskScore,
      report_count: cell.count,
      top_category: topCat as any,
      caption_en: captionEn,
      caption_bn: captionBn,
    });
  });

  return result;
}
