import type * as XLSX from 'xlsx';
// types by SheetNames
export type AdmCustomer = {
  CompanyCode: string;
  BranchCode: string;
  CustomerCode: string;
  CustomerType: string | null;
  CustomerTerm: string | number;
  CustomerDebtorCode: string | null;
  CustomerAccountCode: string | null;
  CustomerName: string;
  CustomerAdd1: string;
  CustomerAdd2: string;
  CustomerAdd3: string;
  CustomerAdd4: string;
  CustomerTel: string;
  CustomerFax: string;
  CustomerContact: string;
  CustomerEmail: string;
  CustomerRebateType: string | null;
  RebateBy: string;
  Percentage20: number;
  Rate20: number;
  Percentage40: number;
  Rate40: number;
  IsSLBillable: boolean;
  IsSuspect: boolean;
  ProfitCenter: string | null;
  ReportFiles: string | null;
  CreateBy: string;
  CreateDate: string; // or Date if parsed
  EditBy: string;
  EditDate: string; // or Date if parsed
  IsAutoEmail: boolean;
  IsMailByHours: boolean;
  IsMailByJobs: boolean;
  IsMailByPeriod: boolean;
  ReportFileName: string;
  CustomerDebtorCodeNew: string | null;
  IsInternalCompany: boolean;
  SageMappingCode: string | null;
}

export type AdmArea = {
  CompanyCode: string;
  BranchCode: string;
  AreaCode: string;
  Description: string;
  EstDistance: number;
  EstTime: number;
  Category: string;
  AreaZone: string;
  CreateBy: string;
  CreateDate: string; // Format like "00:00.0", could be string unless parsed as time
  EditBy: string;
  EditDate: string; // Format like "34:35.0", same here
}

export type ShipperConsignee  ={
  CompanyCode: string;
  BranchCode: string;
  Code: string;
  Name: string;
  CustomerCode: string | null;
  CreateBy: string;
  CreateDate: string; // e.g., "00:00.0"
  EditBy: string;
  EditDate: string;   // e.g., "30:23.0"
  IsAutoEmail: boolean | number; // could be 0/1 or true/false depending on usage
  Email: string | null;
  SageMappingCode: string | null;
}

export type ShipperConDelivery ={
  CompanyCode: string;
  BranchCode: string;
  ShipConCode: string;
  DeliveryToCode: string;
  Name: string;
  IsDefault: boolean | number; // typically 0/1 or true/false
  Address1: string;
  Address2: string;
  Address3: string;
  Address4: string | null;
  AreaCode: string;
  Tel: string | null;
  Fax: string | null;
  Contact: string | null;
}

export type AllowanceType = {
  CompanyCode: string;
  BranchCode: string;
  AllowanceType: string | number;
  Description: string;
  Rate: number;
  UnpayHours: number;
  BasisRate: string; // Assuming time format like "00:00.0"
  CreateBy: string;
  CreateDate: string; // Also in time format like "18:32.0"
  EditBy: string;
  EditDate: string; // Same format
}

export type DropOnDropOff = {
  CompanyCode: string;
  BranchCode: string;
  LocationID: string;
  LocationName: string;
  LocationType: string;
  LocationAdd1: string;
  LocationAdd2: string;
  LocationAdd3: string;
  LocationAdd4: string | null;
  LocationTel: string | null;
  LocationFax: string | null;
  LocationContact: string | null;
  CreateBy: string;
  CreateDate: string; // e.g., "09:55.0"
  EditBy: string;
  EditDate: string; // e.g., "09:55.0"
  DGCRate20: number | null;
  DGCRate40: number | null;
  EffectiveDate: string | null;
  DGCRate20Old: number | null;
  DGCRate40Old: number | null;
  JournelPort: string | null;
}

export type Opts = {
  generateOutput: (fileSuffixName: string, content: string) => void;
  workbook: XLSX.WorkBook;
  fileBaseName: string;
  buCode: string;
}