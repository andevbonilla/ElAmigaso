import {loadCommercialFiles} from './detail';
import {exampleInfo} from './example-info';
import type {Source} from './stp';

// A static asset works on Vercel and locally; parsing stays in the browser.
export async function loadExampleCsv(fetcher:typeof fetch=fetch):Promise<Source>{
 const response=await fetcher(exampleInfo.csvPath,{cache:'no-store'});
 if(!response.ok)throw new Error('No se pudo cargar el CSV de ejemplo. Intenta de nuevo o carga tu archivo en Subir datos.');
 const source=await loadCommercialFiles([new File([await response.blob()],exampleInfo.csvPath.split('/').at(-1)!)]);
 return {...source,example:exampleInfo};
}
