export type Sale = { id: string; date: string; time: string; client: string; order: string; payment: string; status: string; advisor: string; total: number };
export type ImportResult = { rows: Sale[]; issues: string[]; duplicates: number; rejected: number; sourceCount: number };
export const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
export const compact = (value: number) => new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
export const norm = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toUpperCase();
export const headers = ['FACTURA', 'CLIENTE', 'PEDIDO', 'FORMA DE PAGO', 'ESTADO', 'ASESOR', 'TOTAL'];
export function amount(v: unknown): number {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').trim().replace(/(?:COP|\$|\s)/gi, '');
  if (!s) return NaN;
  if (/^-?\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(s)) s = s.replace(/,/g, '');
  else if (/^-?\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d+,\d{1,2}$/.test(s)) s = s.replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}
export function parseRows(grid: unknown[][]): ImportResult {
  const hi = grid.findIndex(row => headers.every(h => row.map(norm).includes(h)));
  if (hi < 0) throw new Error('No encontramos las 7 columnas de ABAKO: Factura, Cliente, Pedido, Forma de Pago, Estado, Asesor y Total. Exporta la bandeja de facturación.');
  const positions = headers.map(h => grid[hi].map(norm).indexOf(h));
  const rows: Sale[] = [], issues: string[] = [], seen = new Map<string, Sale>();
  let rejected = 0, duplicates = 0, sourceCount = 0;
  for (let i = hi + 1; i < grid.length; i++) {
    if (grid[i].every(v => v == null || String(v).trim() === '')) continue;
    sourceCount++;
    const [invoice, client, order, payment, status, advisor, total] = positions.map(p => grid[i][p]);
    const m = String(invoice ?? '').trim().match(/^(.+?)-(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::\d{2})?$/);
    const n = amount(total);
    let valid = !!m;
    if (m) {
      const d = new Date(m[2] + 'T00:00:00Z');
      valid = !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === m[2] && Number(m[3].slice(0, 2)) < 24 && Number(m[3].slice(3)) < 60;
    }
    if (!valid || !Number.isFinite(n) || !norm(client) || !norm(advisor) || !norm(status) || !norm(payment)) {
      rejected++; issues.push(`Fila ${i + 1}: fecha, importe o campos obligatorios inválidos. No se incluyó.`); continue;
    }
    const row: Sale = { id: norm(m![1]), date: m![2], time: m![3], client: norm(client), order: String(order ?? ''), payment: norm(payment), status: norm(status), advisor: norm(advisor), total: n };
    const prior = seen.get(row.id);
    if (prior) {
      if (JSON.stringify(prior) === JSON.stringify(row)) { duplicates++; continue; }
      throw new Error(`La factura ${row.id} aparece con datos distintos. Revisa los duplicados antes de importar; necesitamos un identificador único por documento.`);
    }
    seen.set(row.id, row); rows.push(row);
  }
  if (!rows.length) throw new Error('El archivo no contiene facturas válidas. Revisa las fechas y los importes.');
  return { rows: rows.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)), issues, rejected, duplicates, sourceCount };
}
export function group(rows: Sale[], key: 'advisor' | 'client' | 'payment' | 'date') {
  const result = new Map<string, { name: string; total: number; count: number }>();
  for (const row of rows) { const x = result.get(row[key]) ?? { name: row[key], total: 0, count: 0 }; x.total += row.total; x.count++; result.set(row[key], x); }
  return [...result.values()].sort((a, b) => b.total - a.total);
}
export function daysBetween(start: string, end: string) {
  if (!start || !end || start > end) return [];
  const result: string[] = []; const d = new Date(start + 'T00:00:00Z');
  for (let i = 0; d.toISOString().slice(0, 10) <= end && i < 3660; i++) { result.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); }
  return result;
}
export function demoSales(): Sale[] {
  const names = ['Laura Méndez', 'Carlos Rojas', 'Diana Torres', 'Andrés Ruiz', 'Paula Castro'];
  return Array.from({ length: 185 }, (_, i) => ({ id: `DEMO${1000 + i}`, date: `2026-09-${String(1 + i % 30).padStart(2, '0')}`, time: `${String(8 + i % 10).padStart(2, '0')}:30`, client: `COMERCIO DEMO ${String(1 + i % 63).padStart(2, '0')}`, order: String(5000 + i), payment: i % 4 ? 'CONTADO' : 'CREDITO', status: i % 23 ? 'APROBADO' : 'ANULADO', advisor: norm(names[i % 5]), total: 180000 + (i * 7919 % 1800000) })).sort((a,b) => a.date.localeCompare(b.date));
}
