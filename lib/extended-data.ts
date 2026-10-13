import { amount, norm } from './data';
export const advisorHeaders = ['ASESOR','UNIDADES','SUBTOTAL','COSTO','IVA','OTROS IMPUESTOS','DESCUENTO'];
export const routeHeaders = ['TIPO','DESCRIPCION','CLIENTE','DOCUMENTO','NOVEDAD','VALOR','FECHA','HORA','LATITUD','LONGITUD'];
export type AdvisorRow = { advisor:string; units:number; subtotal:number; cost:number; tax:number; otherTax:number; discount:number; sourceRow:number };
export type RoutePoint = { type:string; description:string; client:string; document:string; value:number; date:string; time:string; lat:number; lng:number; sourceRow:number };
function table(grid:unknown[][], headers:string[]) {
  const row=grid.findIndex(r=>headers.every(h=>r.map(norm).includes(h)));
  if(row<0)throw new Error(`Este archivo no corresponde a esta vista. Columnas necesarias: ${headers.join(', ')}.`);
  const positions=headers.map(h=>grid[row].map(norm).indexOf(h));
  return grid.slice(row+1).map((r,i)=>({values:positions.map(p=>r[p]),sourceRow:row+i+2})).filter(r=>r.values.some(v=>v!=null&&String(v).trim()!==''));
}
export function parseAdvisors(grid:unknown[][]) {
  const rows:AdvisorRow[]=[],issues:string[]=[]; let totalRows=0;
  for(const {values:v,sourceRow} of table(grid,advisorHeaders)) {
    if(['GRAND TOTAL','TOTAL GENERAL','TOTAL'].includes(norm(v[0]))){totalRows++;continue;}
    const n=v.slice(1).map(amount);
    if(!norm(v[0])||n.some(x=>!Number.isFinite(x))){issues.push(`Fila ${sourceRow}: nombre o importes inválidos; excluida.`);continue;}
    rows.push({advisor:norm(v[0]),units:n[0],subtotal:n[1],cost:n[2],tax:n[3],otherTax:n[4],discount:n[5],sourceRow});
  }
  if(!rows.length)throw new Error('No hay resúmenes válidos en el archivo.');
  const counts=new Map<string,number>();rows.forEach(r=>counts.set(r.advisor,(counts.get(r.advisor)??0)+1));
  const repeated=[...counts].filter(([,n])=>n>1).map(([name])=>name);
  return {rows,issues,totalRows,repeated};
}
export function parseRoute(grid:unknown[][]) {
  const rows:RoutePoint[]=[],issues:string[]=[]; let reordered=false,previous='';
  for(const {values:v,sourceRow} of table(grid,routeHeaders)) {
    const date=v[6] instanceof Date?v[6].toISOString().slice(0,10):String(v[6]??'').trim();
    const time=String(v[7]??'').trim();const lat=amount(v[8]),lng=amount(v[9]),value=amount(v[5]);
    const stamp=`${date}T${time}`;
    const parsed=new Date(`${stamp}Z`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180||(lat===0&&lng===0)||!Number.isFinite(value)||!norm(v[0])) {issues.push(`Fila ${sourceRow}: fecha, coordenadas o valor inválidos; excluida.`);continue;}
    if(previous&&stamp<previous)reordered=true;previous=stamp;
    rows.push({type:norm(v[0]),description:norm(v[1]),client:String(v[2]??'').trim(),document:String(v[3]??'').trim(),value,date,time,lat,lng,sourceRow});
  }
  if(!rows.length)throw new Error('No hay puntos válidos en el recorrido.');
  rows.sort((a,b)=>(a.date+'T'+a.time).localeCompare(b.date+'T'+b.time)||a.sourceRow-b.sourceRow);
  return {rows,issues,reordered};
}
