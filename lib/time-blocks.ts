export interface TimeBlock {
  id: string;
  userId: string;
  projectId: string | null;
  mvpItemId: string | null;
  label: string;
  startAt: Date;
  endAt: Date;
  color: string;
  done: boolean;
}

export interface DbTimeBlock {
  id: string;
  user_id: string;
  project_id: string | null;
  mvp_item_id: string | null;
  label: string;
  start_at: string;
  end_at: string;
  color: string;
  done: boolean;
  created_at: string;
}

export function dbToTimeBlock(r: DbTimeBlock): TimeBlock {
  return {
    id: r.id,
    userId: r.user_id,
    projectId: r.project_id,
    mvpItemId: r.mvp_item_id,
    label: r.label,
    startAt: new Date(r.start_at),
    endAt: new Date(r.end_at),
    color: r.color,
    done: r.done,
  };
}

export function todayRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function dayRange(d: Date): { start: Date; end: Date } {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function weekRange(d: Date): { start: Date; end: Date } {
  // Monday-based week
  const dow = d.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = (dow === 0 ? -6 : 1 - dow);
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMon);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function monthRange(d: Date): { start: Date; end: Date } {
  const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function snapTo15min(d: Date): Date {
  const out = new Date(d);
  out.setMinutes(Math.round(out.getMinutes() / 15) * 15, 0, 0);
  return out;
}

export function toTimeInput(d: Date): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function fromTimeInput(base: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const out = new Date(base);
  out.setHours(h, m, 0, 0);
  return out;
}

export const TIMELINE_START_HOUR = 6;
export const TIMELINE_END_HOUR = 22;
export const PX_PER_MINUTE = 1.2;

export function minutesFromStart(d: Date): number {
  return (d.getHours() - TIMELINE_START_HOUR) * 60 + d.getMinutes();
}

export function durationMins(start: Date, end: Date): number {
  return Math.max(15, (end.getTime() - start.getTime()) / 60000);
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

export interface BlockColumn {
  col: number;
  totalCols: number;
}

export function computeColumns(blocks: TimeBlock[]): Map<string, BlockColumn> {
  const sorted = [...blocks].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const result = new Map<string, BlockColumn>();
  const colEnds: Date[] = [];

  for (const b of sorted) {
    let col = -1;
    for (let i = 0; i < colEnds.length; i++) {
      if (b.startAt >= colEnds[i]) { col = i; colEnds[i] = b.endAt; break; }
    }
    if (col === -1) { col = colEnds.length; colEnds.push(b.endAt); }
    result.set(b.id, { col, totalCols: 1 });
  }

  for (const b of sorted) {
    const layout = result.get(b.id)!;
    const overlapping = sorted.filter(
      (o) => o.id !== b.id && o.startAt < b.endAt && o.endAt > b.startAt
    );
    const maxCol = Math.max(layout.col, ...overlapping.map((o) => result.get(o.id)!.col));
    layout.totalCols = maxCol + 1;
  }

  return result;
}
