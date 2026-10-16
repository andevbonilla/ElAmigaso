import JSZip from 'jszip';
import {SaxesParser} from 'saxes';
export async function readFlatGrids(file:File):Promise<unknown[][][]>{
 if(file.size>64*1024*1024)throw new Error('El archivo supera 64 MB. Exporta meses o semanas por separado.');
 const extension=file.name.split('.').pop()?.toLowerCase();if(!['xlsx','csv'].includes(extension??''))throw new Error('Selecciona Excel .xlsx o CSV.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(bytes[0]!==80||bytes[1]!==75){if(extension!=='csv')throw new Error('El archivo no contiene un Excel válido.');const Papa=(await import('papaparse')).default;const result=Papa.parse<string[]>(new TextDecoder().decode(bytes),{skipEmptyLines:'greedy'});if(result.errors.length)throw new Error('El CSV tiene filas mal delimitadas.');return [result.data];}
 const zip=await JSZip.loadAsync(bytes);const strings:string[]=[];
 const shared=zip.file('xl/sharedStrings.xml');if(shared){const parser=new SaxesParser();let inside=false,text=false,value='';parser.on('opentag',t=>{if(t.name==='si'){inside=true;value='';}if(t.name==='t'&&inside)text=true;});parser.on('text',t=>{if(text)value+=t;});parser.on('closetag',t=>{if(t.name==='t')text=false;if(t.name==='si'){strings.push(value);inside=false;}});await stream(shared,parser);}
 const grids:unknown[][][]=[];const sheets=Object.keys(zip.files).filter(n=>/^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 for(const name of sheets){const grid:unknown[][]=[];const parser=new SaxesParser();let row:unknown[]=[],rowNumber=0,col=0,type='',value='',capture=false;
 parser.on('opentag',t=>{if(t.name==='row'){row=[];rowNumber=Number(t.attributes.r)||grid.length+1;}if(t.name==='c'){const address=String(t.attributes.r??'A1').match(/^[A-Z]+/)?.[0]??'A';col=0;for(const l of address)col=col*26+l.charCodeAt(0)-64;col--;type=String(t.attributes.t??'');value='';}if(t.name==='v'||t.name==='t')capture=true;});parser.on('text',t=>{if(capture)value+=t;});parser.on('closetag',t=>{if(t.name==='v'||t.name==='t')capture=false;if(t.name==='c')row[col]=type==='s'?strings[Number(value)]??'':type==='inlineStr'||type==='str'?value:value===''?null:type==='b'?value==='1':Number.isFinite(Number(value))?Number(value):value;if(t.name==='row'){while(grid.length<rowNumber-1)grid.push([]);grid.push(row);}});await stream(zip.file(name)!,parser);grids.push(grid);}
 if(!grids.length)throw new Error('El Excel no tiene hojas legibles.');return grids;
}
async function stream(entry:JSZip.JSZipObject,parser:SaxesParser){const xml=await entry.async('string');if(xml.length>160*1024*1024)throw new Error('La hoja es demasiado grande. Exporta por semanas.');parser.write(xml);parser.close();}
