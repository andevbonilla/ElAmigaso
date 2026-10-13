export const zones = [
  { name:'Chapinero', lat:4.651, lng:-74.061, scale:1.45 },
  { name:'Usaquén', lat:4.710, lng:-74.036, scale:1.2 },
  { name:'Suba', lat:4.742, lng:-74.09, scale:1.05 },
  { name:'Engativá', lat:4.69, lng:-74.112, scale:0.9 },
  { name:'Kennedy', lat:4.627, lng:-74.154, scale:1.35 },
  { name:'Teusaquillo', lat:4.638, lng:-74.091, scale:1.1 },
  { name:'Puente Aranda', lat:4.611, lng:-74.117, scale:0.85 },
];
export type MapClient = { id: number; name: string; lat:number; lng:number; zone:string; advisor:string; total:number; invoices:number };
export function mapDemo(): MapClient[] { return zones.flatMap((z,zi)=>Array.from({length:12},(_,i)=>({id:zi*12+i, name:`Comercio demo ${String(zi*12+i+1).padStart(2,'0')}`, lat:z.lat+Math.sin(i*2.4+zi)*0.012, lng:z.lng+Math.cos(i*3.1+zi)*0.013, zone:z.name, advisor:['Laura Méndez','Carlos Rojas','Diana Torres'][i%3], total:Math.round((350000+(i*183721+zi*23903)%2400000)*z.scale), invoices:2+(i*7+zi)%12}))); }
