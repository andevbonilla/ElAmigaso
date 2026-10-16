import {readFile} from 'node:fs/promises';
import {loadCommercialFiles} from './detail';
import {exampleInfo} from './example-info';
import type {Source} from './stp';
let cached:Promise<Source>|undefined;
export function loadLocalExample(){
 if(!cached)cached=(async()=>{const bytes=await readFile(exampleInfo.localPath);const source=await loadCommercialFiles([new File([new Uint8Array(bytes)],exampleInfo.fileName)]);return {...source,example:exampleInfo};})().catch(error=>{cached=undefined;throw error;});
 return cached;
}
