import {observedSale} from './data';
import type {Source,Rules,Customer} from './stp';
import type {DetailLine} from './detail-types';
export type GeoPoint={client:string;lat:number;lng:number;total:number;advisor:string;zone:string};
export type Comparison={name:string;total:number;cost:number;clients:number};
export const validGeo=(lat:number|null,lng:number|null):boolean=>lat!==null&&lng!==null&&Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-5&&lat<=14&&lng>=-82&&lng<=-66;
export function visualData(source:Source,rules:Rules,customers:Customer[],filters:{advisor:string;segment:string;zone:string}){
 // Detailed sources use a compound invoice id; simulated sources use the document itself.
 const detailAllowed=new Set(source.sales.filter(s=>observedSale(s)&&s.date>=rules.start&&s.date<=rules.end).map(s=>JSON.stringify([s.client,s.date,source.kind==='detail'&&!source.demo?JSON.parse(s.id)[2]:s.id])));
 const segments=new Map(customers.map(c=>[c.client,c.segment]));
 const lines=(source.lines??[]).filter(l=>detailAllowed.has(JSON.stringify([l.client,l.date,l.document]))&&(!filters.advisor||l.advisor===filters.advisor)&&(!filters.zone||l.zone===filters.zone)&&(!filters.segment||segments.get(l.client)===filters.segment));
 const clients=new Set(lines.map(l=>l.client));const total=lines.reduce((n,l)=>n+l.subtotal,0),cost=lines.reduce((n,l)=>n+l.cost,0);
 const totals=new Map<string,number>();for(const l of lines)totals.set(l.client,(totals.get(l.client)??0)+l.subtotal);
 const positions=new Map<string,DetailLine>();for(const l of [...lines].sort((a,b)=>a.date.localeCompare(b.date)))if(validGeo(l.lat,l.lng))positions.set(l.client,l);
 const points:GeoPoint[]=[...positions].map(([client,l])=>({client,lat:l.lat!,lng:l.lng!,total:totals.get(client)??0,advisor:l.advisor,zone:l.zone}));
 const grouped=(field:(l:DetailLine)=>string):Comparison[]=>{const result=new Map<string,{total:number;cost:number;clients:Set<string>}>();for(const l of lines){const name=field(l)||'SIN DATO',item=result.get(name)??{total:0,cost:0,clients:new Set<string>()};item.total+=l.subtotal;item.cost+=l.cost;item.clients.add(l.client);result.set(name,item);}return [...result].map(([name,v])=>({name,total:v.total,cost:v.cost,clients:v.clients.size})).sort((a,b)=>b.total-a.total);};
 return {lines,clients:clients.size,total,cost,points,mappedTotal:points.reduce((n,p)=>n+p.total,0),documents:new Set(lines.map(l=>JSON.stringify([l.clientId,l.date,l.document]))).size,dates:grouped(l=>l.date).sort((a,b)=>a.name.localeCompare(b.name)),categories:grouped(l=>l.category),advisors:grouped(l=>l.advisor),zones:grouped(l=>l.zone)};
}
