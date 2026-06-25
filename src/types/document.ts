import { LetterContent, ProposalContent, CompanyDetails, StyleConfig } from './index';

export type DocumentCategory =
  | 'letter'
  | 'proposal'
  | 'quotation'
  | 'invoice'
  | 'purchase-order'
  | 'receipt'
  | 'certificate'
  | 'memo'
  | 'report'
  | 'contract-cover'
  | 'delivery-challan';

export interface InvoiceContent {
  invoiceNumber: string;
  poNumber?: string;
  dueDate: string;
  items: InvoiceLineItem[];
  taxRate: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  shipping?: number;
  currencySymbol: string;
  notes?: string;
  terms?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface QuotationContent {
  quoteNumber: string;
  validUntil: string;
  items: QuotationLineItem[];
  taxRate: number;
  currencySymbol: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
}

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderContent {
  poNumber: string;
  vendorName: string;
  vendorAddress: string;
  shipTo: string;
  items: PurchaseOrderLineItem[];
  taxRate: number;
  currencySymbol: string;
  deliveryDate?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface PurchaseOrderLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptContent {
  receiptNumber: string;
  receivedFrom: string;
  amount: number;
  currencySymbol: string;
  paymentMethod: 'cash' | 'check' | 'bank-transfer' | 'card' | 'upi';
  paymentDate: string;
  purpose: string;
  notes?: string;
}

export interface CertificateContent {
  certificateNumber: string;
  recipientName: string;
  recipientTitle?: string;
  organization?: string;
  description: string;
  issueDate: string;
  expiryDate?: string;
  certificateType: 'achievement' | 'completion' | 'participation' | 'authorization' | 'membership';
}

export interface MemoContent {
  to: string;
  from: string;
  cc?: string;
  date: string;
  subject: string;
  body: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ReportContent {
  reportTitle: string;
  reportNumber?: string;
  preparedBy: string;
  reviewedBy?: string;
  date: string;
  executiveSummary: string;
  sections: ReportSection[];
  conclusion?: string;
  appendices?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
}

export interface ContractCoverContent {
  contractTitle: string;
  contractNumber: string;
  partyA: string;
  partyB: string;
  date: string;
  effectiveDate: string;
  termMonths?: number;
  jurisdiction?: string;
  signedBy: string;
  witnessBy?: string;
}

export interface DeliveryChallanContent {
  challanNumber: string;
  date: string;
  supplierName: string;
  supplierAddress: string;
  customerName: string;
  customerAddress: string;
  items: DeliveryChallanItem[];
  vehicleNumber?: string;
  deliveryPerson?: string;
  notes?: string;
}

export interface DeliveryChallanItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

export type DocumentContent =
  | LetterContent
  | ProposalContent
  | InvoiceContent
  | QuotationContent
  | PurchaseOrderContent
  | ReceiptContent
  | CertificateContent
  | MemoContent
  | ReportContent
  | ContractCoverContent
  | DeliveryChallanContent;

export interface BusinessDocument {
  id: string;
  type: DocumentCategory;
  title: string;
  content: DocumentContent;
  branding: BrandKitRef;
  style: StyleConfig;
  pages: PageConfig[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  favorite?: boolean;
}

export interface PageConfig {
  id: string;
  number: number;
  orientation: 'portrait' | 'landscape';
  header?: HeaderFooterConfig;
  footer?: HeaderFooterConfig;
  elements: CanvasElement[];
}

export interface HeaderFooterConfig {
  enabled: boolean;
  content: string;
  companyLogo?: boolean;
  showPageNumber?: boolean;
  legalDisclaimer?: boolean;
  socialIcons?: boolean;
  qrCode?: boolean;
  confidentialNotice?: boolean;
  registrationNumbers?: boolean;
}

export interface CanvasElement {
  id: string;
  type: 'logo' | 'address' | 'contact' | 'qr-code' | 'signature' | 'stamp' | 'social-icons' | 'watermark' | 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  props: Record<string, any>;
}

export interface BrandKitRef {
  brandId: string;
}
