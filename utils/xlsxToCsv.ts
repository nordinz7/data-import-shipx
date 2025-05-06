import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export function convertAllXlsxInFolderToCsv(folderPath: string): void {
    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
        if (file.endsWith('.xlsx')) {
            const xlsxFilePath = path.join(folderPath, file);
            const workbook = XLSX.readFile(xlsxFilePath);
            const sheetNames = workbook.SheetNames;

            sheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const csvData = XLSX.utils.sheet_to_csv(worksheet);
                const csvFilePath = path.join('./output', `${path.parse(file).name}_${sheetName}.csv`);
                fs.writeFileSync(csvFilePath, csvData);
            });
        }
    });
}