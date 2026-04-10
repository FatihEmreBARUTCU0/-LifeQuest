import type { AppLocale } from '../types/locale';
import type { QuestPriority } from '../types';

const patternsTr = {
  urgent: [/fatura/i, /öde/i, /ödeme/i, /deadline/i, /acil/i],
  low: [/kitap/i, /oku/i, /film/i, /dinlen/i],
};

const patternsEn = {
  urgent: [/bill/i, /pay/i, /payment/i, /deadline/i, /urgent/i],
  low: [/book/i, /read/i, /movie/i, /rest/i, /relax/i],
};

export function inferPriority(title: string, locale: AppLocale): QuestPriority {
  const t = title.trim();
  if (!t) return 'normal';
  const p = locale === 'en' ? patternsEn : patternsTr;
  if (p.urgent.some((re) => re.test(t))) return 'urgent';
  if (p.low.some((re) => re.test(t))) return 'low';
  return 'normal';
}
