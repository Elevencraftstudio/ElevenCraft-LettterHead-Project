export interface CompanyDetails {
  name: string;
  tagline: string;
  logoType: 'upload' | 'initials' | 'preset';
  logoUrl?: string;
  logoInitials?: string;
  logoPreset?: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  email: string;
  website: string;
}

export interface LetterContent {
  recipientName: string;
  recipientCompany: string;
  recipientAddress: string;
  date: string;
  referenceNo?: string;
  subject: string;
  salutation: string;
  body: string;
  closing: string;
  senderName: string;
  senderTitle: string;
  signatureType: 'draw' | 'type' | 'none';
  signatureText?: string;
  signatureDrawing?: string;
}

export interface BudgetLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ProposalContent {
  projectTitle: string;
  objectives: string;
  requirements: string;
  budgetItems: BudgetLineItem[];
  taxRate: number;
  currencySymbol: string;
  notes?: string;
}

export type DocumentMode = 'letter' | 'proposal';

export type LayoutTheme = 'classic-top' | 'modern-split' | 'side-ribbon' | 'minimalist-clean' | 'creative-block';

export interface StyleConfig {
  theme: LayoutTheme;
  fontPair: 'executive' | 'modern' | 'creative' | 'minimalist';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  paperBackground: 'solid-white' | 'cream-texture' | 'warm-ivory';
  watermarkText?: string;
  showWatermark: boolean;
  accentBarPosition: 'top' | 'left' | 'bottom' | 'none';
}
