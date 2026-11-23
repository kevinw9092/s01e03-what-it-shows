// What is actually wrong in a big ticket, one entry per bug engineering has to fix.
// causes.ts says which date-order bug a report's tenant and channel lead to. Some reports
// describe a different bug altogether: the date moved by one day, not a month and a day
// swapped. The desk lists those by id (desk-notes.json, `oneDayMove`). They are their own
// problem, not a footnote under the tenant's cause.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift' | 'unplaced';

export const PROBLEM_TEXT: Record<Problem, { name: string; what: string }> = {
  parser: {
    name: 'shared parser reads day-first dates month first',
    what: 'Day and month swap on every booking from a day-first tenant (app, email, booking-v2 form).',
  },
  hint: {
    name: 'booking-v3 date hint says MM/DD/YYYY',
    what: 'People on a day-first booking-v3 tenant type the date the hint shows, month first; the form reads it day first.',
  },
  shift: {
    name: 'date moves by one day',
    what: 'The date is one day off, not swapped: the invite lands a day early or late, or differs by where the guest is.',
  },
  unplaced: {
    name: 'no tenant on file',
    what: 'The report cannot be placed: its tenant is not in the directory.',
  },
};

export function problemOf(r: Pick<Report, 'id' | 'channel'>, t: Tenant | undefined, shifted: readonly string[]): Problem {
  if (shifted.includes(r.id)) return 'shift';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
};

// Reports merged into `ticket`, one row per problem, biggest first.
export function problemsIn(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  shifted: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), shifted);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
