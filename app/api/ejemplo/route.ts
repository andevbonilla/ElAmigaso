import {loadLocalExample} from '@/lib/local-example';
import {localExampleAllowed} from '@/lib/example-info';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const headers={'Cache-Control':'private, no-store'};
 if(!localExampleAllowed(new URL(request.url).hostname,process.env.VERCEL))return Response.json({error:'El Excel de ejemplo está disponible en este equipo. Carga tu archivo en Subir datos.'},{status:404,headers});
 try{return Response.json(await loadLocalExample(),{headers});}
 catch{return Response.json({error:'No se encontró el Excel de ejemplo en su ruta original. Puedes cargarlo desde Subir datos.'},{status:404,headers});}
}
