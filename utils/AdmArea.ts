import { uniqBy } from "lodash";
import { AdmArea } from "../types";

export default function convertToArea(data: AdmArea[]){
    const converted = data.map((row: AdmArea) => {
        return {
            uuid: row['uuid'] || '',
            name: row['name'] || row['Description'] || '',
            description: row['Description'],
            code: row['AreaCode'],
            zone: row['AreaZone'],
            category: row['Category'] || '',
            location: '',
            locationPolygon:'',
            tags: '',
        };
    });

    return uniqBy(converted, 'code');
}