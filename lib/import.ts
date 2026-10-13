import { headers, norm, parseRows } from './data';
export async function readSalesFile(file: File) {
  if (file.size > 15 * 1024 * 1024) throw new Error('El archivo supera 15 MB. Exporta un periodo más corto.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') {
    const Papa = (await import('papaparse')).default;
    const result = Papa.parse<string[]>(await file.text(), { skipEmptyLines: 'greedy' });
    if (result.errors.length) throw new Error('El CSV contiene filas mal delimitadas. Vuelve a exportarlo con encabezados y comillas para los importes con comas.');
    return { ...parseRows(result.data), sheet: 'CSV' };
  }
  if (extension !== 'xlsx') throw new Error('Selecciona un archivo .xlsx o .csv.');
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  for (const sheet of workbook.worksheets) {
    const grid: unknown[][] = [];
    sheet.eachRow(row => {
      const cells: unknown[] = [];
      for (let i = 1; i <= Math.max(row.cellCount, 7); i++) {
        const cell = row.getCell(i);
        cells.push(cell.type === ExcelJS.ValueType.Number ? cell.value : cell.text);
      }
      grid.push(cells);
    });
    if (grid.some(row => headers.every(h => row.map(norm).includes(h)))) return { ...parseRows(grid), sheet: sheet.name };
  }
  throw new Error('Ninguna hoja tiene las columnas de la bandeja de facturación de ABAKO.');
}
