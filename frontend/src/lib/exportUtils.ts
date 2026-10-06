/**
 * Utility helper to export tabular data to downloadable CSV file.
 */
export function exportToCsv(
  filename: string,
  dataOrHeaders: any[],
  rowsOrColumns?: any[]
): boolean {
  try {
    let headers: string[] = [];
    let formattedRows: string[] = [];

    if (Array.isArray(dataOrHeaders) && Array.isArray(rowsOrColumns) && typeof rowsOrColumns[0] === 'object' && 'header' in rowsOrColumns[0]) {
      // Called as: exportToCsv(filename, dataObjects, columnDefs)
      const dataObjects = dataOrHeaders;
      const columnDefs = rowsOrColumns as { header: string; key: string }[];
      headers = columnDefs.map((col) => col.header);
      formattedRows = dataObjects.map((rowObj) =>
        columnDefs
          .map((col) => {
            const val = rowObj[col.key];
            if (val === null || val === undefined) return '""';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      );
    } else {
      // Called as: exportToCsv(filename, headers, rowsArray)
      headers = dataOrHeaders as string[];
      const rows = (rowsOrColumns || []) as (string | number | boolean | null | undefined)[][];
      formattedRows = rows.map((row) =>
        row
          .map((cell) => {
            if (cell === null || cell === undefined) return '""';
            return `"${String(cell).replace(/"/g, '""')}"`;
          })
          .join(',')
      );
    }

    const csvContent = [headers.join(','), ...formattedRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
}
