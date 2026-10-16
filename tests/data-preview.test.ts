import test from 'node:test';
import assert from 'node:assert/strict';
import {detailSource,parseDetail} from '../lib/detail';
import {filterPreview,previewTable} from '../lib/data-preview';
import {blankProfile,type Source} from '../lib/stp';

test('preview shows product lines without turning them into invoices and respects date and accent-insensitive search',()=>{
 const headers=['Cliente','Código Cliente','Documento','Fecha','Código Artículo','Descripción Artículo','Categoría','Asesor','Unidades','Subtotal','Costo','Latitud','Longitud'];
 const row=['Tienda uno','001','EJ1','2026-09-01','P1','Arroz','Granos','Asesor A',2,100,70,4.65,-74.1];
 const source=detailSource([parseDetail([headers,row,[...row.slice(0,4),'P2','Café',...row.slice(6)],[...row.slice(0,3),'2026-10-01',...row.slice(4)]])],['example.csv']);
 const table=previewTable(source),rules={start:'2026-09-01',end:'2026-09-30'};
 assert.equal(source.sales.length,2);assert.equal(table.rows.length,3);assert.equal(filterPreview(table,rules,'').length,2);assert.equal(filterPreview(table,rules,'cafe').length,1);assert.equal(filterPreview(table,rules,'unknown').length,0);assert.equal(table.rows[0][13],4.65);assert.equal(table.rows[0][14],-74.1);
});
test('profile previews retain unknown values separately from zero and show profiles even with no invoices',()=>{
 const source:Source={sales:[],profiles:[{...blankProfile('Tienda'),potential:0}],names:['profile.csv'],demo:false,duplicates:0,rejected:0,issues:[]};
 const table=previewTable(source,true);assert.equal(table.rows[0][3],0);assert.equal(table.rows[0][5],null);assert.equal(filterPreview(table,{start:'2026-09-01',end:'2026-09-30'},'tienda').length,1);assert.equal(previewTable(source).rows.length,0);
});
