'use client';

import * as XLSX from 'xlsx';

export type ExportRow = Record<string, string | number | null | undefined>;

function toWorksheetRows(rows: ExportRow[]) {
  return rows.map((row) => {
    const clean: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(row)) {
      clean[key] = value ?? '';
    }
    return clean;
  });
}

function timestampedFilename(base: string, ext: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${base}-${stamp}.${ext}`;
}

export function exportToCsv(filenameBase: string, rows: ExportRow[]) {
  if (rows.length === 0) return;
  const sheet = XLSX.utils.json_to_sheet(toWorksheetRows(rows));
  const csv = XLSX.utils.sheet_to_csv(sheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, timestampedFilename(filenameBase, 'csv'));
}

export function exportToExcel(filenameBase: string, rows: ExportRow[], sheetName = 'Data') {
  if (rows.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(toWorksheetRows(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, timestampedFilename(filenameBase, 'xlsx'));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
