export function observedPeriod(start:string,end:string){
 const first=new Date(start+'T00:00:00Z'),last=new Date(end+'T00:00:00Z');
 if(!Number.isFinite(first.getTime())||!Number.isFinite(last.getTime())||start>end)return {days:0,fullMonths:false};
 const days=Math.round((last.getTime()-first.getTime())/86400000)+1;
 const monthEnd=new Date(Date.UTC(last.getUTCFullYear(),last.getUTCMonth()+1,0)).toISOString().slice(0,10);
 return {days,fullMonths:start.endsWith('-01')&&end===monthEnd};
}
export function monthlyEvaluation(source:{demo:boolean;example?:unknown},rules:{start:string;end:string;complete:boolean}):'demo'|'ready'|'blocked'{
 if(source.demo||source.example)return 'demo';
 return observedPeriod(rules.start,rules.end).fullMonths&&rules.complete?'ready':'blocked';
}
export function monthBounds(month:string){const start=month+'-01',date=new Date(start+'T00:00:00Z');if(!/^\d{4}-\d{2}$/.test(month)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,7)!==month)throw new Error('Selecciona un mes válido.');return {start,end:new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).toISOString().slice(0,10)};}
