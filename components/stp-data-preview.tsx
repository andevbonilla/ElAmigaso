'use client';
import {useMemo,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useStp} from './stp-store';
import {ExampleButton,downloadCsv} from './stp-shared';
import {previewTable,filterPreview} from '@/lib/data-preview';
import {csvText} from '@/lib/stp';

const pageSize=8;
const number=new Intl.NumberFormat('es-CO',{maximumFractionDigits:2});
export default function StpDataPreview(){
 const {source,rules,loadingExample,exampleError}=useStp();
 const path=usePathname();
 // Reset paging and search when the file or page changes.
 return <Preview key={`${path}:${source?.names.join('|')}:${rules.start}:${rules.end}`} source={source} rules={rules} loading={loadingExample} error={exampleError}/>;
}
function Preview({source,rules,loading,error}:{source:ReturnType<typeof useStp>['source'];rules:ReturnType<typeof useStp>['rules'];loading:boolean;error:string}){
 const [profiles,setProfiles]=useState(false),[search,setSearch]=useState(''),[page,setPage]=useState(1);
 const table=useMemo(()=>source?previewTable(source,profiles):null,[source,profiles]);
 const rows=useMemo(()=>table?filterPreview(table,rules,search):[],[table,rules.start,rules.end,search]);
 const pages=Math.max(1,Math.ceil(rows.length/pageSize)),current=Math.min(page,pages),offset=(current-1)*pageSize;
 return <section className="stp-panel stp-data-preview" aria-label="Previsualización de los datos"><div className="preview-heading"><h1>Previsualización de datos</h1>{source?.example&&<a className="button secondary" href={source.example.csvPath} download>Descargar CSV de ejemplo</a>}</div>
 {!source?<div className="preview-empty"><p role="status">{loading?'Cargando los datos de ejemplo…':error||'Carga un Excel o usa el ejemplo para ver sus datos aquí.'}</p>{!loading&&<ExampleButton/>}</div>:<>
 <p className="stp-muted preview-origin">{source.example?`CSV convertido del Excel ${source.example.fileName}`:source.demo?'Datos ficticios':source.names.join(' · ')}</p>
 <p className="stp-note">{profiles?'Ficha comercial actual. Los campos sin completar aparecen como «Sin dato».':`Registros del ${rules.start} al ${rules.end}. ${source.kind==='detail'?'Cada fila es un producto dentro de una factura; varias filas pueden pertenecer a la misma factura.':'Cada fila es una factura.'} Los filtros de otras gráficas no cambian esta tabla.`}</p>
 <div className="preview-controls"><div className="preview-tabs" aria-label="Tipo de datos"><button type="button" className={`button ${profiles?'secondary':'primary'}`} aria-pressed={!profiles} onClick={()=>{setProfiles(false);setPage(1);}}>Ventas</button><button type="button" className={`button ${profiles?'primary':'secondary'}`} aria-pressed={profiles} onClick={()=>{setProfiles(true);setPage(1);}}>Fichas comerciales</button></div><label>Buscar en los datos<input type="search" placeholder="Cliente, producto, asesor…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label></div>
 {rows.length>0&&table?<><div className="preview-table" tabIndex={0} role="region" aria-label="Tabla de datos con desplazamiento horizontal"><table><caption>{profiles?'Fichas comerciales':'Ventas importadas'} · {rows.length.toLocaleString('es-CO')} registros coinciden</caption><thead><tr>{table.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.slice(offset,offset+pageSize).map((row,i)=><tr key={offset+i}>{row.map((value,j)=><td key={j} className={typeof value==='number'?'preview-number':undefined}>{value===null||value===''?'Sin dato':typeof value==='number'?(j>=13?String(value):number.format(value)):value}</td>)}</tr>)}</tbody></table></div><div className="preview-pagination"><p role="status">Mostrando {offset+1}–{Math.min(offset+pageSize,rows.length)} de {rows.length.toLocaleString('es-CO')} · página {current} de {pages}</p><div><button type="button" className="button secondary" disabled={current===1} onClick={()=>setPage(current-1)}>← Anterior</button><button type="button" className="button secondary" disabled={current===pages} onClick={()=>setPage(current+1)}>Siguiente →</button><button type="button" className="button secondary" onClick={()=>downloadCsv('datos-visibles-STP.csv',csvText([table.headers,...rows.map(row=>row.map(v=>v??''))]))}>Exportar estos registros</button></div></div></>:<p className="preview-empty" role="status">{profiles?'No hay fichas que coincidan. Puedes completarlas en Subir datos.':'No hay registros para esta búsqueda y periodo.'}</p>}
 </>}
 </section>;
}
