import { groupBy } from "lodash";
import { Opts, ShipperConDelivery, ShipperConsignee } from "../types";
import { DEFAULT_IF_REQUIRED_NOT_FOUND } from "../constants";
import { cloneJsonDataFromSheet, extractPostcode, getCityFromPostcode, getFullAddress, getStateFromPostcode } from "./xlsxToCsv";

export const convertToShipCon = (shipConCompanies: ShipperConsignee[], shipConAddresses: ShipperConDelivery[], opts: Opts) => {
  const groupedAddresses = groupBy(shipConAddresses, 'ShipConCode');
  const groupedAreaCodes = groupBy(cloneJsonDataFromSheet(opts.workbook.Sheets['AdmArea']), 'AreaCode');

  return shipConCompanies.map((company) => {
    const foundAddresses = groupedAddresses[company.Code] || [];
    const addresses = foundAddresses.map((address) => {
      const fulladdr = getFullAddress(address, ['Address1', 'Address2', 'Address3', 'Address4']);
      const postcode = extractPostcode(fulladdr);
      const city = getCityFromPostcode(postcode!);
      const state = getStateFromPostcode(postcode!);

            return {
            // --- Address ---
            "name": address['Name']|| DEFAULT_IF_REQUIRED_NOT_FOUND,
            "type": ['DELIVERY'],
            "countryAlpha3": "MYS",
            "address1": address["Address1"] || "",
            "address2": address["Address2"] || "",
            "address3": address["Address3"] || "",
            "address4": address["Address4"] || "",
            "city": city || address["City"] || "",
            "state": state || address["State"] || "",
            "district": city || address["City"] || "",
            "postCode": postcode || "",
            "areaCode": address["AreaCode"] || DEFAULT_IF_REQUIRED_NOT_FOUND,
            "zone": groupedAreaCodes[address['AreaCode']]?.[0]?.AreaZone || DEFAULT_IF_REQUIRED_NOT_FOUND,
            "location.type": "",
            "location.coordinates": "",
            "phone": address["Tel"] || "",
            "fax": address["Fax"] || "",
            "tags": parseInt(address['IsDefault']) ? ["isDefault"]: [],
            "status": "activated",
            "uuid": "",
            "zzz": "",
          }
    }).filter(address => address.address1)

    const contacts = foundAddresses.map((address) => ({
            // --- Contact ---
            "name": address["Contact"] || "",
            "email": "",
            "phone": "",
            "title": "",
            "designation": "",
            "notes": "",
            "status": "activated",
            "uuid": "",
            "zzz": "",
    }))

    return {
          // --- General Info ---
          "no": "",
          "code": company['Code'],
          "name": company['Name'],
          "description": "",
          "status": "activated",
          "tags": "",
          "overrideDuplicateCode": "TRUE",
          "types": ['shipperConsignee'],
          // --- Country & Currency ---
          "country.name": "Malaysia",
          "country.alpha3": "MYS",
          "currency.code": "MYR",
          "currency.uuid": "",
          // --- Billing/Creditor ---
          "billTo.code": "",
          "billTo.uuid": "",
          "creditorCode": "",
          "creditorTerm": "",
          // --- Debtor ---
          "debtorCode": "",
          "debtorTerm": "",
          // --- Tax/Registration ---
          "taxNumber": "",
          "registration": "",
          // --- UUID ---
          "uuid": "",
          addresses,
          contacts
    };
  });
}