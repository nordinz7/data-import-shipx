import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { ADDRESS_COLUMNS, DEFAULT_IF_REQUIRED_NOT_FOUND } from '../constants';
import { AdmCustomer, Opts } from '../types';
import convertToArea from './AdmArea';
import { pick } from 'lodash';
import { convertToShipCon } from './ShipCon';

// Helper: Extract postcode (5 digits) from address string
export function extractPostcode(address: string): string | null {
    const match = address.match(/\b\d{5}\b/g);
    return match ? match[match.length - 1] : null;
}

// Helper: Lookup city/state from postcode using db.csv (tab-separated)
function loadPostcodeDB(): Record<string, { City: string, State: string }> {
    if (!fs.existsSync('./db.csv')) return {};
    const dbRaw = fs.readFileSync('./db.csv', 'utf8');
    const lines = dbRaw.split('\n');
    const headers = lines[0].split('\t');
    const db: Record<string, { City: string, State: string }> = {};
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split('\t');
        if (row.length < 3) continue;
        db[row[0]] = { City: row[1], State: row[2] };
    }
    return db;
}

const postcodeDB = loadPostcodeDB();

export function getStateFromPostcode(postcode: string): string {
    return postcode ? postcodeDB[postcode]?.State : "";
}

export function getCityFromPostcode(postcode: string): string {
    return postcode ? postcodeDB[postcode]?.City : "";
}

function getDebtorCode(row){
    return row["CustomerDebtorCodeNew"] || row["customerDebtorCode"] || "";
}

function getPkCode(row){
    return row['CustomerID'] || row['CustomerCode'] || "";
}

function getCompanyName(row){
    return row["CustomerName"] || DEFAULT_IF_REQUIRED_NOT_FOUND;
}

function getTypes(row, type : 'address' | 'company'){
    const customerType = row["CustomerType"] || "";
    let rtn = {
        address: [] as string[],
        company: [] as string[]
    }

    switch (customerType.toUpperCase()) {
        case "ALL":
            rtn.address = ["PORT", "TRANSIT_YARD"];
            rtn.company = ["port", "transitYard"];
            break;
        case "PORT":
            rtn.address = ["PORT"];
            rtn.company = ["port"];
            break;
        case "CONTAINER YARD":
            rtn.address = [ "TRANSIT_YARD"];
            rtn.company = [ "transitYard"];
            break;
        default:
            rtn.address = ["BILLING"];
            rtn.company = ["billing"];
            break;
    }

    return  JSON.stringify(rtn[type]);
}

function convert(row){
    return {
        // --- General Info ---
        "no": "",
        "code": getPkCode(row),
        "name": getCompanyName(row),
        "description": "",
        "status": "activated",
        "tags": "",
        "overrideDuplicateCode": "TRUE",
        "types": getTypes(row, 'company'),
        // --- Country & Currency ---
        "country.name": "Malaysia",
        "country.alpha3": "MYS",
        "currency.code": "MYR",
        "currency.uuid": "",
        // --- Billing/Creditor ---
        "billTo.code": "",
        "billTo.uuid": "",
        "creditorCode": "",
        "creditorTerm": row["CustomerTerm"] || "",
        // --- Debtor ---
        "debtorCode": getDebtorCode(row),
        "debtorTerm": "",
        // --- Tax/Registration ---
        "taxNumber": "",
        "registration": "",
        // --- UUID ---
        "uuid": "",
        // --- Address ---
        "address.name": row["CustomerName"] || DEFAULT_IF_REQUIRED_NOT_FOUND,
        "address.type": getTypes(row, 'address'),
        "address.countryAlpha3": "MYS",
        "address.address1": row["CustomerAdd1"] || "",
        "address.address2": row["CustomerAdd2"] || "",
        "address.address3": row["CustomerAdd3"] || "",
        "address.address4": row["CustomerAdd4"] || "",
        "address.city": row["City"] || "",
        "address.district": row["City"] || "",
        "address.postCode": row["Postcode"] || "",
        "address.areaCode": row["areaCode"] || DEFAULT_IF_REQUIRED_NOT_FOUND,
        "address.zone": row["zone"] || DEFAULT_IF_REQUIRED_NOT_FOUND,
        "address.location.type": "",
        "address.location.coordinates": "",
        "address.phone": row["CustomerTel"] || "",
        "address.fax": row["CustomerFax"] || "",
        "address.tags": JSON.stringify(["isDefault"]),
        "address.status": "activated",
        "address.uuid": "",
        "address.zzz": "",
        // --- Contact ---
        "contact.name": row["CustomerContact"] || "",
        "contact.email": row["CustomerEmail"] || "",
        "contact.phone": row["CustomerTel"] || "",
        "contact.title": "",
        "contact.designation": "",
        "contact.notes": "",
        "contact.status": "activated",
        "contact.uuid": "",
        "contact.zzz": "",
    }
}

export function getFullAddress(row, cols = ADDRESS_COLUMNS){
    return cols.map(k => row[k] || '').join(' ');
}

function getCompanies(jsonData){
        // Replace headers starting with 'Location' to 'Customer'
        const columns = Object.keys(jsonData[0] || {});
        columns.forEach(col => {
            if (col.startsWith('Location')) {
                jsonData.forEach(row => {
                    row['Customer' + col.slice('Location'.length)] = row[col];
                    delete row[col];
                });
            }
        });

        // Combine address fields and extract postcode, city, state
        jsonData.forEach(row => {
            row.FullAddress = getFullAddress(row);
            row.Postcode = extractPostcode(row.FullAddress) || '';
            row.City = getCityFromPostcode(row.Postcode) || row.City || '';
            row.State = getStateFromPostcode(row.Postcode) || row.State || '';
        });
        return jsonData;
}

export function cloneJsonDataFromSheet(worksheet: XLSX.WorkSheet){
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
    const jsonData = structuredClone(rawData);
    return jsonData;
}

function Json2Csv(json){
    const out = XLSX.utils.json_to_sheet(json);
    const content=  XLSX.utils.sheet_to_csv(out);
    return content;
}

function extractFromSheet(sheetName: string, opts: Opts) {
    switch (sheetName) {
        case 'AdmCustomer': {
            const data = getCompanies(cloneJsonDataFromSheet(opts.workbook.Sheets[sheetName])).filter((row:AdmCustomer) =>  row['SageMappingCode'] !== 'NULL');
            const converted = data.map(convert)
            opts.generateOutput(sheetName, Json2Csv(converted));
            break;
        }
        case 'Drop On Drop Off':{
            const data = getCompanies(cloneJsonDataFromSheet(opts.workbook.Sheets[sheetName]));
            const converted = data.map(convert)
            opts.generateOutput(sheetName, Json2Csv(converted));
            break;
        }
        case 'AdmArea':{
            const areaCodes = convertToArea(cloneJsonDataFromSheet(opts.workbook.Sheets[sheetName]));
            const zones = areaCodes.map((areaCode)=> ({...pick(areaCode, ['code', 'name', 'description', 'sorting', 'status']), code: areaCode.zone }));
            opts.generateOutput('AreaCodes', Json2Csv(areaCodes));
            opts.generateOutput('AreaZones', Json2Csv(zones));
            break;
        }
        case 'ShipperConsignee':{
            if (!opts.workbook.SheetNames.includes('ShipperConDelivery')) {
                console.log('Sheet "ShipperConsignee" not found in the workbook.');
                return;
            }

            const shipConCompanies = cloneJsonDataFromSheet(opts.workbook.Sheets[sheetName]);
            const shipConAddresses = cloneJsonDataFromSheet(opts.workbook.Sheets['ShipperConDelivery']);
            const data = convertToShipCon(shipConCompanies, shipConAddresses, opts);
            opts.generateOutput(sheetName, Json2Csv(data));
        }
        // default:
        //     const content=  XLSX.utils.sheet_to_csv(opts.workbook.Sheets[sheetName]);
        //     opts.generateOutput(sheetName, content);
        //     break;
    }
}

function extractFromWorkbook(workbook: XLSX.WorkBook, filePath: string) {
    const sheetNames = workbook.SheetNames;
    const fileBaseName = path.parse(filePath).name;
    const generateOutput = (fileSuffixName: string, content) => {
        const csvFilePath = path.join('./output', `${fileBaseName}_${fileSuffixName}.csv`);
        fs.writeFileSync(csvFilePath, content);
    }

    sheetNames.forEach((sheetName)=>extractFromSheet(sheetName, { workbook, generateOutput }));
}


export function convertAllXlsxInFolderToCsv(folderPath: string): void {
    const files = fs.readdirSync(folderPath);
    const xlsxFiles = files.filter(file => file.endsWith('.xlsx'));

    xlsxFiles.forEach(file => {
            const xlsxFilePath = path.join(folderPath, file);
            const workbook = XLSX.readFile(xlsxFilePath);
            extractFromWorkbook(workbook, xlsxFilePath);
    });
}