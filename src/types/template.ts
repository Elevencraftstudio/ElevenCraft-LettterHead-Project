import { DocumentCategory } from './document';
import { CompanyDetails, StyleConfig } from './index';

export type TemplateCategory =
  | 'corporate'
  | 'modern'
  | 'minimal'
  | 'creative'
  | 'legal'
  | 'healthcare'
  | 'education'
  | 'construction'
  | 'restaurant'
  | 'real-estate'
  | 'technology'
  | 'all';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  documentType: DocumentCategory;
  thumbnail: string;
  company: CompanyDetails;
  style: StyleConfig;
  tags: string[];
  popular: boolean;
  createdAt: string;
}

export interface TemplateLibrary {
  templates: Template[];
  favorites: string[];
  recentlyUsed: string[];
  searchQuery: string;
  activeFilter: TemplateCategory;
  activeDocType: DocumentCategory | 'all';
}
