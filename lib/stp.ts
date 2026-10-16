import {norm,observedSale, type Sale} from './data';
import type {DetailLine} from './detail-types';
import type {ExampleInfo} from './example-info';

export type Segment = 'Consolidados'|'En desarrollo'|'Por recuperar'|'Por captar'|'Sin evidencia';
export type Quadrant = 'Desarrollar'|'Fidelizar'|'Mantener'|'Atención eficiente'|'Pendiente';
export type Profile = {client:string; business:string; zone:string; potential:number|null; cycle:number|null; feasibility:'Alta'|'Media'|'Baja'|''; prospect:boolean; categories:number|null; categoryGoal:number|null};
export type Rules = {start:string; end:string; complete:boolean; minOrders:number; minMonths:number; highPurchase:number; highPotential:number; cycle:number; recoveryFactor:number; capacity:number};
export type Source = {sales:Sale[]; profiles:Profile[]; names:string[]; demo:boolean; duplicates:number; rejected:number; issues:string[];lines?:DetailLine[];kind?:'invoice'|'detail';example?:ExampleInfo};
export type Customer = Profile & {orders:number; total:number; monthly:number; ticket:number; last:string; recency:number|null; activeMonths:number; segment:Segment; reason:string; quadrant:Quadrant; gap:number|null; cutoff:number; peerCut:boolean; advisor:string; ready:boolean};
export function chooseCustomer(customers:Customer[],selected:string[],name:string,capacity:number){const current=selected.filter(n=>customers.some(c=>c.client===n&&c.ready));if(current.includes(name))return current.filter(n=>n!==name);if(!customers.some(c=>c.client===name&&c.ready))throw new Error('Completa potencial, viabilidad y evidencia antes de elegir este cliente.');if(current.length>=capacity)throw new Error(`La capacidad definida es de ${capacity} clientes. Retira uno antes de añadir otro o revisa la capacidad en Datos.`);return [...current,name];}
export const segments:Segment[]=['Consolidados','En desarrollo','Por recuperar','Por captar','Sin evidencia'];
export const quadrants:Quadrant[]=['Desarrollar','Fidelizar','Atención eficiente','Mantener'];
export const initialRules:Rules={start:'2026-04-01',end:'2026-09-30',complete:false,minOrders:6,minMonths:1,highPurchase:250000,highPotential:500000,cycle:30,recoveryFactor:2,capacity:12};
export const blankProfile=(client:string):Profile=>({client: norm(client),business:'',zone:'',potential:null,cycle:null,feasibility:'',prospect:false,categories:null,categoryGoal:null});
export function mergeSales(batches:Sale[][]){const seen=new Map<string,Sale>();let duplicates=0;for(const rows of batches)for(const sale of rows){const prior=seen.get(sale.id);if(prior){if(JSON.stringify(prior)!==JSON.stringify(sale))throw new Error(`La factura ${sale.id} tiene datos distintos entre archivos. Revisa el identificador antes de combinar.`);duplicates++;}else seen.set(sale.id,sale);}return {sales:[...seen.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)),duplicates};}
export function monthsIn(start:string,end:string){if(!start||!end||start>end)return 0;return (Number(end.slice(0,4))-Number(start.slice(0,4)))*12+Number(end.slice(5,7))-Number(start.slice(5,7))+1;}
const days=(a:string,b:string)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
export function analyze(source:Source,rules:Rules):Customer[]{
 if(!rules.start||!rules.end||rules.start>rules.end)return [];
 const months=monthsIn(rules.start,rules.end);
 const approved=source.sales.filter(s=>observedSale(s)&&s.date<=rules.end);
 const byName=new Map<string,Sale[]>();for(const s of approved){const key=norm(s.client);byName.set(key,[...(byName.get(key)??[]),s]);}
 const profiles=new Map(source.profiles.map(p=>[norm(p.client),p]));
 const categoryCounts=new Map<string,Set<string>>();if(source.kind==='detail'){const validDocs=new Set(approved.filter(s=>s.date>=rules.start).map(s=>JSON.stringify([s.client,s.date,source.demo?s.id:JSON.parse(s.id)[2]])));for(const l of source.lines??[]){if(!validDocs.has(JSON.stringify([l.client,l.date,l.document])))continue;const set=categoryCounts.get(norm(l.client))??new Set<string>();if(l.category)set.add(l.category);categoryCounts.set(norm(l.client),set);}}
 const names=new Set([...source.sales.filter(s=>s.date<=rules.end).map(s=>norm(s.client)),...profiles.keys()]);
 const raw=[...names].map(client=>{const history=byName.get(client)??[];const sales=history.filter(s=>s.date>=rules.start);const total=sales.reduce((a,s)=>a+s.total,0);const sorted=[...history].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));const last=sorted.at(-1);const p=profiles.get(client)??blankProfile(client);return {...p,categories:source.kind==='detail'&&!source.demo?(categoryCounts.get(client)?.size??0):p.categories,client,orders:sales.length,total,monthly:total/months,ticket:sales.length?total/sales.length:0,last:last?.date??'',recency:last?days(last.date,rules.end):null,activeMonths:new Set(sales.map(s=>s.date.slice(0,7))).size,advisor:last?.advisor??'Por asignar'};});
 return raw.map(r=>{
  const peers=r.business?raw.filter(x=>x.business===r.business&&x.orders>0).map(x=>x.monthly).sort((a,b)=>a-b):[];
  const peerCut=peers.length>=3;const mid=Math.floor(peers.length/2);const cutoff=peerCut?(peers.length%2?peers[mid]:(peers[mid-1]+peers[mid])/2):rules.highPurchase;
  let segment:Segment='En desarrollo',reason='Compra observada por debajo de los cortes de consolidación; validar necesidades y oportunidad.';
  const cycle=r.cycle??rules.cycle;
  if(!r.last){segment=r.prospect?'Por captar':'Sin evidencia';reason=r.prospect?'Prospecto declarado en la ficha; no hay compras válidas observadas.':'Sin compras válidas observadas. La ausencia en el archivo no demuestra inactividad.';}
  else if(rules.complete&&r.recency!==null&&r.recency>cycle*rules.recoveryFactor){segment='Por recuperar';reason=`Última compra hace ${r.recency} días; supera ${cycle*rules.recoveryFactor} días (${rules.recoveryFactor} ciclos). Historial declarado completo.`;}
  else if(r.orders>=rules.minOrders&&r.activeMonths>=rules.minMonths&&r.monthly>=cutoff&&!(r.categories!==null&&r.categories<=1&&r.categoryGoal!==null&&r.categoryGoal>1)){segment='Consolidados';reason=`${r.orders} facturas en ${r.activeMonths} meses activos y compra mensual ≥ ${Math.round(cutoff).toLocaleString('es-CO')} COP (${peerCut?'mediana de su tipo de negocio':'corte manual'}).`;}
  else if(r.recency!==null&&r.recency>cycle*rules.recoveryFactor&&!rules.complete){reason='Baja actividad observada; confirmar cobertura del historial antes de clasificar como recuperación.';}
  if(segment==='En desarrollo'&&r.categories!==null&&r.categories<=1&&r.categoryGoal!==null&&r.categoryGoal>1)reason='Compra concentrada en una categoría o menos, según los datos disponibles. Validar oportunidad de ampliar surtido.';
  const high=r.monthly>=cutoff;const quadrant:Quadrant=r.potential===null?'Pendiente':r.potential>=rules.highPotential?(high?'Fidelizar':'Desarrollar'):(high?'Mantener':'Atención eficiente');
  return {...r,segment,reason,quadrant,gap:r.potential===null?null:Math.max(0,r.potential-r.monthly),cutoff,peerCut,ready:r.potential!==null&&!!r.feasibility&&r.feasibility!=='Baja'&&segment!=='Sin evidencia'};
 }).sort((a,b)=>(b.gap??-1)-(a.gap??-1)||b.total-a.total||a.client.localeCompare(b.client));
}

export type Positioning = {benefit:string; service:string; channel:string; owner:string; kpi:'Ticket promedio'|'Recompra'|'Reactivación'|'Primera compra'; goal:number; validation:string};
export const defaultPositioning:Record<Segment,Positioning>={
 'Consolidados':{owner:'',benefit:'Continuidad en tu abastecimiento, con reposición oportuna.',service:'Planificar reposición según el ciclo y confirmar disponibilidad del surtido habitual.',channel:'Visita y seguimiento telefónico',kpi:'Recompra',goal:80,validation:'Confirmar qué valora el cliente y si puede cumplirse la promesa de disponibilidad.'},
 'En desarrollo':{owner:'',benefit:'Orientación para ampliar el surtido según lo que necesita tu negocio.',service:'Visita consultiva, propuesta de categorías pertinentes y seguimiento al pedido.',channel:'Visita consultiva',kpi:'Ticket promedio',goal:10,validation:'Validar necesidad, barreras de compra y categorías con el cliente antes de ofrecer.'},
 'Por recuperar':{owner:'',benefit:'Una oferta pertinente para retomar tu abastecimiento.',service:'Preguntar por la causa de la interrupción y acordar una propuesta de retorno.',channel:'Llamada y visita acordada',kpi:'Reactivación',goal:20,validation:'Confirmar si dejó de comprar y por qué; revisar la viabilidad de atención.'},
 'Por captar':{owner:'',benefit:'Acompañamiento para elegir tu primer surtido.',service:'Diagnosticar el negocio, explicar la oferta y acompañar el primer pedido.',channel:'Visita de diagnóstico',kpi:'Primera compra',goal:20,validation:'Contrastar la oferta con alternativas y confirmar interés y potencial.'},
 'Sin evidencia':{owner:'',benefit:'Pendiente de diagnóstico.',service:'Completar y validar la ficha antes de definir atención.',channel:'Por definir',kpi:'Primera compra',goal:0,validation:'Obtener historial y confirmar la condición de cliente o prospecto.'}
};

export function createDemo():{source:Source;rules:Rules}{
 const sales:Sale[]=[],profiles:Profile[]=[];let serial=0;
 const business=['Tienda de barrio','Minimercado','Cafetería'];const zones=['Suba','Kennedy','Bosa','Engativá'];
 for(let i=0;i<48;i++){
  const group=i%4;const client=`NEGOCIO DEMO ${String(i+1).padStart(2,'0')}`;
  profiles.push({client,business:business[i%3],zone:zones[i%4],potential:group===0?(i%8===0?1400000:2000000):group===1?1800000+i*7000:group===2?1650000+i*3000:(i%8===3?1700000:400000+i*2000),cycle:30,feasibility:i%9===0?'Baja':i%5===0?'Media':'Alta',prospect:group===3,categories:group===0?5:group===1?1:group===2?2:0,categoryGoal:6});
  if(group===3)continue;
  for(let month=4;month<=9;month++){
   if(group===2&&month>6)continue;
   const orders=group===0?3:1;
   for(let n=0;n<orders;n++){serial++;sales.push({id:`DEMO${serial}`,date:`2026-${String(month).padStart(2,'0')}-${String(5+n*9+i%4).padStart(2,'0')}`,time:'10:00',client,order:String(serial),payment:'CONTADO',status:'APROBADO',advisor:`ASESOR DEMO ${i%3+1}`,total:(group===0?300000+i*2700:group===1?80000+i*1200:110000+i*900)*(i===4&&month===9?.5:1)});}
  }
 }
 const centers=[[4.74,-74.08],[4.62,-74.15],[4.61,-74.19],[4.70,-74.12]];
 const lines:DetailLine[]=sales.flatMap(s=>{const i=Number(s.client.slice(-2))-1,p=profiles[i],count=p.categories??1,[lat,lng]=centers[i%4];return Array.from({length:count},(_,n)=>({key:`${s.id}-${n}`,client:s.client,clientId:String(i+1),document:s.id,date:s.date,productId:String(n+1),product:`PRODUCTO DEMO ${n+1}`,category:['ABARROTES','BEBIDAS','ASEO','DULCES','LACTEOS'][n],advisor:s.advisor,channel:p.business,zone:p.zone,created:'2025-01-01',lat:lat+(Math.floor(i/4)-5)*.0015,lng:lng+(i%7-3)*.002,units:3,subtotal:s.total/count,cost:s.total/count*.76,tax:0,discount:0}));});
 return {source:{sales,profiles,lines,kind:'detail',names:['Simulación STP · seis meses · 48 negocios ficticios'],demo:true,duplicates:0,rejected:0,issues:[]},rules:{...initialRules,complete:true,highPotential:1500000}};
}

export const profileHeaders=['Cliente','TipoNegocio','Zona','PotencialMensual','CicloDias','Viabilidad','Prospecto','CategoriasCompradas','CategoriasObjetivo'];
export function parseProfiles(grid:unknown[][]):Profile[]{
 const hi=grid.findIndex(r=>profileHeaders.every(h=>r.map(norm).includes(norm(h))));if(hi<0)throw new Error('La ficha necesita las columnas de la plantilla de clientes STP.');
 const positions=profileHeaders.map(h=>grid[hi].map(norm).indexOf(norm(h)));const seen=new Set<string>();
 return grid.slice(hi+1).filter(r=>r.some(v=>v!=null&&String(v).trim())).map((r,i)=>{const v=positions.map(p=>r[p]);const client=norm(v[0]);if(!client||seen.has(client))throw new Error(`Ficha fila ${hi+i+2}: cliente vacío o repetido.`);seen.add(client);
 const number=(x:unknown,integer=false)=>{if(x==null||String(x).trim()==='')return null;const n=Number(String(x).replace(',','.'));if(!Number.isFinite(n)||n<0||(integer&&!Number.isInteger(n)))throw new Error(`Ficha de ${client}: número inválido. Usa números sin separador de miles.`);return n;};
 const cycle=number(v[4],true);if(cycle===0)throw new Error(`Ficha de ${client}: el ciclo debe ser mayor que cero.`);
 const viability=norm(v[5]);if(viability&&!['ALTA','MEDIA','BAJA'].includes(viability))throw new Error(`Ficha de ${client}: Viabilidad debe ser Alta, Media o Baja.`);
 const prospect=norm(v[6]);if(prospect&&!['SI','NO'].includes(prospect))throw new Error(`Ficha de ${client}: Prospecto debe ser Sí o No.`);
 return {client,business:norm(v[1]),zone:norm(v[2]),potential:number(v[3]),cycle,feasibility:({ALTA:'Alta',MEDIA:'Media',BAJA:'Baja'} as const)[viability as 'ALTA']??'',prospect:prospect==='SI',categories:number(v[7],true),categoryGoal:number(v[8],true)};
 });
}

export function csvText(rows:(string|number)[][]){return '\ufeff'+rows.map(r=>r.map(v=>{const text=typeof v==='string'&&/^[\s]*[=+@\-]/.test(v)?"'"+v:String(v);return '"'+text.replace(/"/g,'""')+'"';}).join(';')).join('\r\n');}

export function planRows(source:Source,rules:Rules,targets:Customer[],plans:Record<Segment,Positioning>,promise:string,horizon:number):(string|number)[][]{
 const rows:(string|number)[][]=[['Origen','PeriodoInicio','PeriodoFin','Cliente','TipoNegocio','Zona','Segmento','AccionT','Asesor','CompraMensualObservada','PotencialMensualEstimado','BrechaEstimada','Viabilidad','PromesaGeneral','Beneficio','Atencion','Canal','CicloDias','Indicador','LineaBase','MetaPropuesta','HorizonteDias','ValidacionPendiente','ReglaMinFacturas','ReglaMinMeses','ReglaCompraAltaFallback','ReglaPotencialAlto','CoberturaConfirmada','CorteCompraAltaCliente','CriterioCompraAlta']];
 for(const c of targets.filter(c=>c.ready)){const p=plans[c.segment];rows.push([source.demo?'SIMULADO':source.example?'REAL_EJEMPLO':'REAL_CARGADO',rules.start,rules.end,c.client,c.business,c.zone,c.segment,c.quadrant,p.owner||c.advisor,c.monthly,c.potential??'',c.gap??'',c.feasibility,promise,p.benefit,p.service,p.channel,c.cycle??rules.cycle,p.kpi,p.kpi==='Ticket promedio'?c.ticket:'Medir después del contacto',p.kpi==='Ticket promedio'?`Aumentar ${p.goal}% sobre ticket observado`:`${p.goal}% de clientes contactados del perfil`,horizon,p.validation,rules.minOrders,rules.minMonths,rules.highPurchase,rules.highPotential,rules.complete?'Sí':'No',c.cutoff,c.peerCut?'Mediana del tipo de negocio':'Corte manual']);}
 return rows;
}


