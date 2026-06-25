import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { CompanyDetails, LetterContent, StyleConfig, ProposalContent, DocumentMode } from '../types';
import { BusinessDocument, DocumentCategory, PageConfig, CanvasElement, DocumentContent } from '../types/document';

interface DocumentState {
  docMode: DocumentMode;
  category: DocumentCategory;
  company: CompanyDetails;
  letter: LetterContent;
  proposal: ProposalContent;
  style: StyleConfig;
  pages: PageConfig[];
  activePageId: string | null;
  selectedElementIds: string[];
  documentTitle: string;
  isDirty: boolean;
}

type DocumentAction =
  | { type: 'SET_DOC_MODE'; payload: DocumentMode }
  | { type: 'SET_CATEGORY'; payload: DocumentCategory }
  | { type: 'SET_COMPANY'; payload: CompanyDetails }
  | { type: 'UPDATE_COMPANY'; payload: Partial<CompanyDetails> }
  | { type: 'SET_LETTER'; payload: LetterContent }
  | { type: 'UPDATE_LETTER'; payload: Partial<LetterContent> }
  | { type: 'SET_PROPOSAL'; payload: ProposalContent }
  | { type: 'UPDATE_PROPOSAL'; payload: Partial<ProposalContent> }
  | { type: 'SET_STYLE'; payload: StyleConfig }
  | { type: 'UPDATE_STYLE'; payload: Partial<StyleConfig> }
  | { type: 'SET_PAGES'; payload: PageConfig[] }
  | { type: 'ADD_PAGE'; payload: PageConfig }
  | { type: 'REMOVE_PAGE'; payload: string }
  | { type: 'SET_ACTIVE_PAGE'; payload: string }
  | { type: 'SELECT_ELEMENT'; payload: string }
  | { type: 'DESELECT_ALL_ELEMENTS' }
  | { type: 'UPDATE_ELEMENT'; payload: { pageId: string; element: CanvasElement } }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'LOAD_DOCUMENT'; payload: Partial<DocumentState> }
  | { type: 'RESET' };

const initialState: DocumentState = {
  docMode: 'letter',
  category: 'letter',
  company: {
    name: 'Eleven Craft Studio',
    tagline: 'Creative Design & Branding Studio',
    logoType: 'preset',
    logoPreset: 'hexagon',
    logoInitials: 'EC',
    logoUrl: '',
    addressLine1: '',
    addressLine2: '',
    phone: '',
    email: '',
    website: '',
  },
  letter: {
    recipientName: 'Dr. Eleanor Parker',
    recipientCompany: 'Innovatech Global Laboratories',
    recipientAddress: '980 Innovation Way, Building C\nInvention District\nSan Francisco, CA 94107',
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    referenceNo: 'LHD-2026-XP92',
    subject: 'Executive Collaboration & Integration Venture Framework',
    salutation: 'Dear Dr. Parker,',
    body: '',
    closing: 'Sincerely and warm regards,',
    senderName: 'Arthur Vance',
    senderTitle: 'Chief Integration Officer',
    signatureType: 'type',
    signatureText: 'Arthur Vance',
    signatureDrawing: '',
  },
  proposal: {
    projectTitle: 'Enterprise Cloud Ingress & Database Optimization Framework',
    objectives: '',
    requirements: '',
    budgetItems: [],
    taxRate: 8,
    currencySymbol: '$',
    notes: '',
  },
  style: {
    theme: 'modern-split',
    fontPair: 'modern',
    primaryColor: '#0f172a',
    secondaryColor: '#4f46e5',
    textColor: '#1e293b',
    paperBackground: 'solid-white',
    watermarkText: 'CONFIDENTIAL',
    showWatermark: true,
    accentBarPosition: 'top',
  },
  pages: [],
  activePageId: null,
  selectedElementIds: [],
  documentTitle: 'Untitled Document',
  isDirty: false,
};

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'SET_DOC_MODE':
      return { ...state, docMode: action.payload, isDirty: true };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload, isDirty: true };
    case 'SET_COMPANY':
      return { ...state, company: action.payload, isDirty: true };
    case 'UPDATE_COMPANY':
      return { ...state, company: { ...state.company, ...action.payload }, isDirty: true };
    case 'SET_LETTER':
      return { ...state, letter: action.payload, isDirty: true };
    case 'UPDATE_LETTER':
      return { ...state, letter: { ...state.letter, ...action.payload }, isDirty: true };
    case 'SET_PROPOSAL':
      return { ...state, proposal: action.payload, isDirty: true };
    case 'UPDATE_PROPOSAL':
      return { ...state, proposal: { ...state.proposal, ...action.payload }, isDirty: true };
    case 'SET_STYLE':
      return { ...state, style: action.payload, isDirty: true };
    case 'UPDATE_STYLE':
      return { ...state, style: { ...state.style, ...action.payload }, isDirty: true };
    case 'SET_PAGES':
      return { ...state, pages: action.payload };
    case 'ADD_PAGE':
      return { ...state, pages: [...state.pages, action.payload] };
    case 'REMOVE_PAGE':
      return { ...state, pages: state.pages.filter(p => p.id !== action.payload) };
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePageId: action.payload };
    case 'SELECT_ELEMENT':
      return { ...state, selectedElementIds: [action.payload] };
    case 'DESELECT_ALL_ELEMENTS':
      return { ...state, selectedElementIds: [] };
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        pages: state.pages.map(p =>
          p.id === action.payload.pageId
            ? { ...p, elements: p.elements.map(e => e.id === action.payload.element.id ? action.payload.element : e) }
            : p
        ),
        isDirty: true,
      };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'LOAD_DOCUMENT':
      return { ...state, ...action.payload, isDirty: false };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface DocumentContextValue {
  state: DocumentState;
  dispatch: React.Dispatch<DocumentAction>;
  setDocMode: (mode: DocumentMode) => void;
  setCategory: (cat: DocumentCategory) => void;
  updateCompany: (data: Partial<CompanyDetails>) => void;
  updateLetter: (data: Partial<LetterContent>) => void;
  updateProposal: (data: Partial<ProposalContent>) => void;
  updateStyle: (data: Partial<StyleConfig>) => void;
  selectElement: (id: string) => void;
  deselectAll: () => void;
}

const DocumentContext = createContext<DocumentContextValue | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  const setDocMode = useCallback((mode: DocumentMode) => dispatch({ type: 'SET_DOC_MODE', payload: mode }), []);
  const setCategory = useCallback((cat: DocumentCategory) => dispatch({ type: 'SET_CATEGORY', payload: cat }), []);
  const updateCompany = useCallback((data: Partial<CompanyDetails>) => dispatch({ type: 'UPDATE_COMPANY', payload: data }), []);
  const updateLetter = useCallback((data: Partial<LetterContent>) => dispatch({ type: 'UPDATE_LETTER', payload: data }), []);
  const updateProposal = useCallback((data: Partial<ProposalContent>) => dispatch({ type: 'UPDATE_PROPOSAL', payload: data }), []);
  const updateStyle = useCallback((data: Partial<StyleConfig>) => dispatch({ type: 'UPDATE_STYLE', payload: data }), []);
  const selectElement = useCallback((id: string) => dispatch({ type: 'SELECT_ELEMENT', payload: id }), []);
  const deselectAll = useCallback(() => dispatch({ type: 'DESELECT_ALL_ELEMENTS' }), []);

  return (
    <DocumentContext.Provider value={{ state, dispatch, setDocMode, setCategory, updateCompany, updateLetter, updateProposal, updateStyle, selectElement, deselectAll }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocument must be used within DocumentProvider');
  return ctx;
}
