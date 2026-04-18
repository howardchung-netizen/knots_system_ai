import * as XLSX from 'xlsx';

const measureTextWidth = (text, font) => {
    const element = document.createElement('span');
    element.style.font = font;
    element.style.whiteSpace = 'nowrap';
    element.style.visibility = 'hidden';
    element.textContent = text;
    document.body.appendChild(element);
    const width = element.offsetWidth;
    document.body.removeChild(element);
    return width;
};

const exportDataToXLSX = (columns, data, documentTitle) => {
    const exportColumns = columns.filter(column => !column.hide);
    const exportData = data.map(row =>
        exportColumns.map(column => {
            if (column.exportData) {
                return column.exportData({ row, value: row[column.field] });
            } else if (column.valueGetter) {
                return column.valueGetter({ row, value: row[column.field] });
            } else if (column.valueFormatter) {
                return column.valueFormatter({ row, value: row[column.field] });
            } else {
                return row[column.field];
            }
        })
    );

    const headerNames = exportColumns.map(column => column.headerName);
    const worksheet = XLSX.utils.aoa_to_sheet([
        headerNames.map(name => ({ t: 's', v: name })),
        ...exportData
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 计算并设置列宽度
    exportColumns.forEach((column, columnIndex) => {
        const maxWidth = Math.max(
            measureTextWidth(column.headerName, 'Arial 12px'),
            ...exportData.map(row => {
                const cellData = row[columnIndex] || '';
                return measureTextWidth(cellData, 'Arial 12px');
            })
        );

        const columnWidth = { wch: Math.ceil(maxWidth / 7) }; // 设置列宽度，调整比例适应具体字体和内容
        worksheet['!cols'] = worksheet['!cols'] || [];
        worksheet['!cols'][columnIndex] = columnWidth;
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAsExcelFile(excelBuffer, `${documentTitle}.xlsx`);
};

const saveAsExcelFile = (buffer, fileName) => {
    const data = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default exportDataToXLSX;
