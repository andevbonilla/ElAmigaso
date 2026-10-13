import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAdvisors,parseRoute,advisorHeaders,routeHeaders} from '../lib/extended-data';
test('summary excludes totals and keeps repeated normalized names without losing value',()=>{const r=parseAdvisors([['Filters'],advisorHeaders,['Ana  Perez',1,100,60,19,0,10],['ANA PEREZ',2,200,120,38,0,20],['Grand Total',3,300,180,57,0,30]]);assert.equal(r.rows.length,2);assert.equal(r.rows.reduce((s,r)=>s+r.subtotal,0),300);assert.deepEqual(r.repeated,['ANA PEREZ']);assert.equal(r.totalRows,1);});
test('summary rejects malformed numeric rows and wrong type',()=>{const r=parseAdvisors([advisorHeaders,['Ana',1,'bad',60,19,0,0],['Leo',1,100,60,19,0,0]]);assert.equal(r.issues.length,1);assert.equal(r.rows.length,1);assert.throws(()=>parseAdvisors([routeHeaders]));});
const point=(time:string,lat=4.6)=>['RE','RECORRIDO','','','',0,'2026-10-09',time,lat,-74.08];
test('route sorts chronology while preserving zero values and unassigned clients',()=>{const r=parseRoute([routeHeaders,point('12:46'),point('09:17')]);assert.equal(r.reordered,true);assert.equal(r.rows[0].time,'09:17');assert.equal(r.rows[0].client,'');assert.equal(r.rows[0].value,0);});
test('route rejects invalid coordinates, impossible dates and clock times',()=>{const badDate=point('09:00');badDate[6]='2026-02-30';const r=parseRoute([routeHeaders,point('09:00',91),point('29:00'),badDate,point('10:00')]);assert.equal(r.rows.length,1);assert.equal(r.issues.length,3);});

import ExcelJS from 'exceljs';
import {importGrid} from '../lib/read-grid';
import {readSalesFile} from '../lib/import';
test('empty merged header cells do not crash Excel imports',async()=>{
 const w=new ExcelJS.Workbook();const s=w.addWorksheet('Facturación');
 s.mergeCells('B2:D2');s.getRow(4).values=advisorHeaders;
 s.getRow(5).values=['Asesor prueba',1,100,60,19,0,0];
 const buffer=await w.xlsx.writeBuffer();const file=new File([new Uint8Array(buffer)],'summary.xlsx');
 const result=await importGrid(file,parseAdvisors);assert.equal(result.rows.length,1);assert.equal(result.rows[0].subtotal,100);
 await assert.rejects(()=>readSalesFile(file),/Rentabilidad por asesor/);
});
