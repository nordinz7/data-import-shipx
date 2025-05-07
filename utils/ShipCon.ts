import { groupBy } from "lodash";
import { Opts, ShipperConDelivery, ShipperConsignee } from "../types";
import { DEFAULT_IF_REQUIRED_NOT_FOUND } from "../constants";
import { cloneJsonDataFromSheet, extractPostcode, getCityFromPostcode, getFullAddress, getStateFromPostcode } from "./xlsxToCsv";

export const convertToShipCon = (shipConCompanies: ShipperConsignee[], shipConAddresses: ShipperConDelivery[], opts: Opts) => {
  const groupedAddresses = groupBy(shipConAddresses, 'ShipConCode');
  const groupedAreaCodes = groupBy(cloneJsonDataFromSheet(opts.workbook.Sheets['AdmArea']), 'AreaCode');

  return shipConCompanies.map((company) => {
    const addresses = groupedAddresses[company.Code] || [];
    const addressDetails = addresses.map((address) => {
      const fulladdr = getFullAddress(address, ['Address1', 'Address2', 'Address3', 'Address4']);
      const postcode = extractPostcode(fulladdr);
      const city = getCityFromPostcode(postcode!);
      const state = getStateFromPostcode(postcode!);

            return {
            // --- Address ---
            "address.name": address['Name']|| DEFAULT_IF_REQUIRED_NOT_FOUND,
            "address.type": ['DELIVERY'],
            "address.countryAlpha3": "MYS",
            "address.address1": address["Address1"] || "",
            "address.address2": address["Address2"] || "",
            "address.address3": address["Address3"] || "",
            "address.address4": address["Address4"] || "",
            "address.city": city || address["City"] || "",
            "address.state": state || address["State"] || "",
            "address.district": city || address["City"] || "",
            "address.postCode": postcode || "",
            "address.areaCode": address["AreaCode"] || DEFAULT_IF_REQUIRED_NOT_FOUND,
            "address.zone": groupedAreaCodes[address['AreaCode']]?.[0]?.AreaZone || DEFAULT_IF_REQUIRED_NOT_FOUND,
            "address.location.type": "",
            "address.location.coordinates": "",
            "address.phone": address["Tel"] || "",
            "address.fax": address["Fax"] || "",
            "address.tags": parseInt(address['IsDefault']) ? JSON.stringify(["isDefault"]): [],
            "address.status": "activated",
            "address.uuid": "",
            "address.zzz": "",
            // --- Contact ---
            "contact.name": address["Contact"] || "",
            "contact.email": "",
            "contact.phone": "",
            "contact.title": "",
            "contact.designation": "",
            "contact.notes": "",
            "contact.status": "activated",
            "contact.uuid": "",
            "contact.zzz": "",
          }
    })

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
          addresses: addressDetails,
    };
  });
}