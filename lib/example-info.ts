export const exampleInfo={
 fileName:'Facturación-2026-10-16T05_26_17.926Z.xlsx',
 localPath:'C:\\Users\\andre\\Downloads\\Facturación-2026-10-16T05_26_17.926Z.xlsx',
 abakoPath:'Portal Transaccional → Reportes → Ventas → Facturación',
 start:'2026-09-01',end:'2026-09-07',downloadedAt:'2026-10-16T05:26:17.926Z',
};
export type ExampleInfo=typeof exampleInfo;
export function exampleDate(value:string){return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Bogota'}).format(new Date(value.length===10?value+'T12:00:00Z':value));}
export const localExampleAllowed=(hostname:string,vercel:string|undefined)=>!vercel&&['localhost','127.0.0.1','[::1]','::1'].includes(hostname);
