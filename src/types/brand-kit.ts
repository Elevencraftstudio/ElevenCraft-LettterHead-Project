export interface BrandKit {
  id: string;
  name: string;
  company: BrandCompanyDetails;
  colors: BrandColors;
  fonts: BrandFonts;
  assets: BrandAssets;
  metadata: BrandMetadata;
}

export interface BrandCompanyDetails {
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

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
  meta: string;
}

export interface BrandAssets {
  logo?: string;
  signature?: string;
  signatureType?: 'draw' | 'type' | 'none';
  signatureText?: string;
  stamp?: string;
  watermark?: string;
  showWatermark?: boolean;
  watermarkText?: string;
}

export interface BrandMetadata {
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  tags?: string[];
}
