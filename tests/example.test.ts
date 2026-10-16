import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {exampleInfo,exampleDate} from '../lib/example-info';
import {loadExampleCsv} from '../lib/example';
import {observedSale} from '../lib/data';
import {visualData} from '../lib/stp-visuals';
import {analyze,initialRules} from '../lib/stp';
import {monthlyEvaluation} from '../lib/stp-period';
test('the real example identifies workbook, original location, reporting period and separate download date',()=>{assert.equal(exampleInfo.fileName,'Facturación-2026-10-16T05_26_17.926Z.xlsx');assert.ok(exampleInfo.localPath.endsWith(exampleInfo.fileName));assert.equal(exampleInfo.start,'2026-09-01');assert.equal(exampleInfo.end,'2026-09-07');assert.match(exampleDate(exampleInfo.downloadedAt),/16.*octubre.*2026/);assert.match(exampleDate(exampleInfo.start),/1.*septiembre.*2026/);assert.match(exampleInfo.abakoPath,/Reportes → Ventas → Facturación/);});
test('the packaged CSV loads through a static fetch on any deployment with dates, identities and geography intact',async()=>{
 const bytes=await readFile(new URL('../public'+exampleInfo.csvPath,import.meta.url));
 const fetcher:typeof fetch=async(input)=>{assert.equal(input,exampleInfo.csvPath);return new Response(bytes);};
 const source=await loadExampleCsv(fetcher);
 assert.equal(source.example,exampleInfo);assert.equal(source.kind,'detail');assert.equal(source.lines!.length,10916);assert.equal(source.sales.length,1969);assert.equal(source.sales.filter(observedSale).length,1968);assert.equal(source.profiles.length,1719);assert.equal(source.rejected,0);assert.equal(source.duplicates,0);
 const dates=source.lines!.map(l=>l.date).sort();assert.equal(dates[0],exampleInfo.start);assert.equal(dates.at(-1),exampleInfo.end);
 const rules={...initialRules,start:exampleInfo.start,end:exampleInfo.end};
 const chart=visualData(source,rules,analyze(source,rules),{advisor:'',segment:'',zone:''});assert.equal(chart.points.length,137);assert.equal(monthlyEvaluation(source,rules),'demo');
 assert.ok(Math.abs(source.sales.reduce((n,s)=>n+s.total,0)-source.lines!.reduce((n,l)=>n+l.subtotal,0))<.01);
});
test('a missing static CSV shows an actionable error instead of loading an HTML fallback',async()=>{
 await assert.rejects(()=>loadExampleCsv(async()=>new Response('Not Found',{status:404})),/CSV de ejemplo/);
 await assert.rejects(()=>loadExampleCsv(async()=>new Response('<html>Not Found</html>')),/CSV tiene filas mal delimitadas/);
});
