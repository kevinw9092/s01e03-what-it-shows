<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEM_TEXT, problemsIn, type Problem } from '#lib/kb/problems';

  // `issues`: where each problem is tracked, problem → link.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const rows = $derived(uniqueById(reports as Report[]));
  const groups = $derived(problemsIn(rows, ticket, tenantOf, notes.oneDayMove));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const exported = $derived((reports as Report[]).length);
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
  {#if exported !== rows.length}<span class="note">({exported} rows in the export; {exported - rows.length} were the same report twice)</span>{/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td>
          <code>{g.problem}</code> · {PROBLEM_TEXT[g.problem].name}
          <div class="what">{PROBLEM_TEXT[g.problem].what}</div>
        </td>
        <td class="n">{g.reports.length}</td>
        <td title={g.tenants.join(', ')}>{g.tenants.length}</td>
        <td class="seen">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if issues[g.problem]}<a href={issues[g.problem]}>open</a>{:else}<span class="none">none yet</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  {#if g.reports.length <= 10}
    <p class="note"><code>{g.problem}</code>: {g.reports.map((r) => r.id).join(', ')}</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .what, .note, .seen { color: var(--muted); font-size: 0.85em; }
  .n { font-weight: 600; }
  .none { color: var(--warn); font-weight: 600; }
</style>
