// normalizeDateWorklet.ts

export function normalizeDateWorklet(rawText: string): string | null {
  'worklet';

  if (!rawText) return null;

  const clean = rawText
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // OCR month map (2-letter)
  const MONTH_MAP: Record<string, string> = {
    JA: '01',
    FE: '02',
    MR: '03',
    AL: '04',
    MA: '05',
    JN: '06',
    JL: '07',
    AU: '08',
    SE: '09',
    OC: '10',
    NO: '11',
    DE: '12',
  };

  const match = clean.match(/\b(\d{2})\s([A-Z]{2})\s(\d{2})\b/);

  if (match) {
    const day = match[1];
    const monthKey = match[2];
    const yearShort = match[3];

    const month = MONTH_MAP[monthKey];
    if (!month) return null;

    const year = `20${yearShort}`;

    return `${year}-${month}-${day}`;
  }

  return null;
}