export async function readGrids(file:File):Promise<unknown[][][]> {
  if(file.size>15*1024*1024)throw new Error('El archivo supera 15 MB. Exporta un periodo más corto.');
  const ext=file.name.split('.').pop()?.toLowerCase();
  if(ext==='csv') {const Papa=(await import('papaparse')).default;const result=Papa.parse<string[]>(await file.text(),{skipEmptyLines:'greedy'});if(result.errors.length)throw new Error('El CSV tiene filas mal delimitadas.');return [result.data];}
  if(ext!=='xlsx')throw new Error('Selecciona un archivo .xlsx o .csv.');
  const ExcelJS=(await import('exceljs')).default;const book=new ExcelJS.Workbook();await book.xlsx.load(await file.arrayBuffer());
  return book.worksheets.map(sheet=>{const grid:unknown[][]=[];sheet.eachRow({includeEmpty:true},row=>{const cells:unknown[]=[];for(let i=1;i<=sheet.columnCount;i++){const c=row.getCell(i);cells.push(c.value==null?null:c.type===ExcelJS.ValueType.Number||c.type===ExcelJS.ValueType.Date?c.value:c.text);}grid.push(cells);});return grid;});
}
export async function importGrid<T>(file:File,parser:(grid:unknown[][])=>T):Promise<T> {const grids=await readGrids(file);let error:unknown;for(const grid of grids){try{return parser(grid);}catch(e){error=e;}}throw error??new Error('El archivo no tiene hojas con datos.');}

