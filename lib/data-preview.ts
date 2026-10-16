import {norm} from './data';
import type {Rules,Source} from './stp';

export type PreviewTable={headers:string[];rows:(string|number|null)[][];dates:(string|null)[];moneyColumns:number[]};
export function previewTable(source:Source,profiles=false):PreviewTable{
 if(profiles)return {headers:['Cliente','Tipo de negocio','Zona','Potencial mensual (COP)','Viabilidad','Ciclo (días)','Prospecto','Categorías compradas','Categorías objetivo'],rows:source.profiles.map(p=>[p.client,p.business,p.zone,p.potential,p.feasibility,p.cycle,p.prospect?'Sí':'No',p.categories,p.categoryGoal]),dates:source.profiles.map(()=>null),moneyColumns:[3]};
 if(source.kind==='detail'&&source.lines)return {headers:['Fecha','Cliente','Documento','Código de producto','Producto','Categoría','Asesor','Zona','Unidades','Subtotal (COP)','Costo (COP)','IVA (COP)','Descuento (COP)','Latitud','Longitud'],rows:source.lines.map(l=>[l.date,l.client,l.document,l.productId,l.product,l.category,l.advisor,l.zone,l.units,l.subtotal,l.cost,l.tax,l.discount,l.lat,l.lng]),dates:source.lines.map(l=>l.date),moneyColumns:[9,10,11,12]};
 return {headers:['Fecha','Hora','Cliente','Factura','Pedido','Forma de pago','Estado','Asesor','Total (COP)'],rows:source.sales.map(s=>[s.date,s.time,s.client,s.id,s.order,s.payment,s.status,s.advisor,s.total]),dates:source.sales.map(s=>s.date),moneyColumns:[8]};
}
export function filterPreview(table:PreviewTable,rules:Pick<Rules,'start'|'end'>,search:string){
 const query=norm(search);
 return table.rows.filter((row,index)=>{const date=table.dates[index];return (!date||(date>=rules.start&&date<=rules.end))&&(!query||row.some(v=>norm(v).includes(query)));});
}
