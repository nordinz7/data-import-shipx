import {convertAllXlsxInFolderToCsv} from './utils/xlsxToCsv';


const main = async () => {
    const xlsxFilePath = './input'
    try {
        await convertAllXlsxInFolderToCsv(xlsxFilePath);
        console.log('Conversion completed successfully.');
    } catch (error) {
        console.error('Error during conversion:', error);
    }
};

main();