import {segments,type Customer} from './stp';
export function targetView(customers:Customer[],selected:string[],filter:string,page:number,pageSize=6){
 const matching=customers.filter(c=>filter==='Todos'||c.quadrant===filter);
 const size=Math.max(1,Math.floor(pageSize)),pages=Math.max(1,Math.ceil(matching.length/size)),current=Math.max(1,Math.min(pages,Math.floor(page)||1));
 const rows=matching.slice((current-1)*size,current*size);
 return {matching,rows,page:current,pages,total:matching.length,first:rows.length?(current-1)*size+1:0,last:rows.length?(current-1)*size+rows.length:0,eligible:matching.filter(c=>c.ready).length,selected:matching.filter(c=>c.ready&&selected.includes(c.client)).length,missingPotential:matching.filter(c=>c.potential===null).length,missingAttention:matching.filter(c=>!c.feasibility).length,profiles:segments.map(segment=>({segment,count:matching.filter(c=>c.segment===segment).length})).filter(p=>p.count>0)};
}
export function missingTargetFields(customer:Pick<Customer,'potential'|'feasibility'|'segment'>){const fields:string[]=[];if(customer.potential===null)fields.push('potencial mensual');if(!customer.feasibility)fields.push('viabilidad de atención');if(customer.segment==='Sin evidencia')fields.push('evidencia de su situación');return fields;}
export const targetLabels:Record<string,string>={Todos:'Todos los clientes',Desarrollar:'Aumentar compras',Fidelizar:'Cuidar compradores importantes','Atención eficiente':'Atender con menos coste',Mantener:'Mantener la relación',Pendiente:'Potencial por estimar'};
