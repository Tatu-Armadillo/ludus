import { useState, useEffect, useMemo } from 'react';
import { ludusApi, type ClassStatusItem } from '@/components/api/ludusApi';

const CLOSING_SOON_DAYS = 7;
const CLOSED_VISIBLE_DAYS = 30;

export type VisualStatus = 'closing_soon' | 'in_progress' | 'closed';

export interface ClassWithStatus extends ClassStatusItem {
  daysRemaining: number;
  visualStatus: VisualStatus;
}

export interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  classes: ClassWithStatus[];
}

export interface ClassesStatusResult {
  closingSoon: ClassWithStatus[];
  byMonth: MonthGroup[];
  closed: ClassWithStatus[];
  loading: boolean;
  error: Error | null;
  empty: boolean;
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = end.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getVisualStatus(daysRemaining: number): VisualStatus {
  if (daysRemaining < 0) return 'closed';
  if (daysRemaining <= CLOSING_SOON_DAYS) return 'closing_soon';
  return 'in_progress';
}

function isWithinClosedWindow(endDate: string): boolean {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - CLOSED_VISIBLE_DAYS);
  return end >= cutoff;
}

function toClassWithStatus(item: ClassStatusItem): ClassWithStatus {
  const end = item.endDate ?? '';
  const daysRemaining = end ? getDaysRemaining(end) : 0;
  const visualStatus = getVisualStatus(daysRemaining);
  return {
    ...item,
    remainingLessons: item.remainingLessons ?? 0,
    daysRemaining,
    visualStatus,
  };
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

function getMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  const name = MONTH_LABELS[m] ?? m;
  return `${name} de ${y}`;
}

function buildMonthGroups(activeClasses: ClassWithStatus[]): MonthGroup[] {
  const map = new Map<string, ClassWithStatus[]>();
  for (const c of activeClasses) {
    if (!c.endDate) continue;
    const d = new Date(c.endDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => {
      const dA = a.daysRemaining;
      const dB = b.daysRemaining;
      if (dA !== dB) return dA - dB;
      return (a.remainingLessons ?? 0) - (b.remainingLessons ?? 0);
    });
  }
  const keys = Array.from(map.keys()).sort();
  return keys.map(monthKey => ({
    monthKey,
    monthLabel: getMonthLabel(monthKey),
    classes: map.get(monthKey)!,
  }));
}

export function useClassesStatus(): ClassesStatusResult {
  const [items, setItems] = useState<ClassStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    ludusApi
      .getClassesStatus(ac.signal)
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (cancelled || (e instanceof Error && e.name === 'AbortError')) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  return useMemo(() => {
    const withStatus = items.map(toClassWithStatus);
    const closedFiltered = withStatus.filter(
      (c) => c.visualStatus === 'closed' && isWithinClosedWindow(c.endDate ?? '')
    );
    const active = withStatus.filter((c) => c.visualStatus !== 'closed');
    const closingSoon = active.filter((c) => c.visualStatus === 'closing_soon');
    const byMonth = buildMonthGroups(active);
    const closed = closedFiltered.sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    );

    return {
      closingSoon,
      byMonth,
      closed,
      loading,
      error,
      empty: items.length === 0,
    };
  }, [items, loading, error]);
}
