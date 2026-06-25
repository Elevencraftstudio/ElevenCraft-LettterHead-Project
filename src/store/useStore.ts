import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { CompanyDetails, LetterContent, StyleConfig, ProposalContent, DocumentMode } from '../types';
import { DocumentCategory, PageConfig, CanvasElement } from '../types/document';
import { BrandKit } from '../types/brand-kit';
import { TemplateCategory } from '../types/template';

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface AppStore {
  // Document state
  docMode: DocumentMode;
  category: DocumentCategory;
  company: CompanyDetails;
  letter: LetterContent;
  proposal: ProposalContent;
  style: StyleConfig;
  documentTitle: string;
  isDirty: boolean;

  // Multi-page
  pages: PageConfig[];
  activePageId: string | null;

  // Canvas
  selectedElementIds: string[];
  canvasViewport: CanvasViewport;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // UI
  activeSidebarTab: string;
  sidebarWidth: number;
  themeMode: 'dark' | 'light';
  notifications: AppNotification[];

  // Undo history
  undoStack: any[];
  redoStack: any[];
  maxHistory: number;

  // Actions
  setDocMode: (mode: DocumentMode) => void;
  setCategory: (cat: DocumentCategory) => void;
  setCompany: (company: CompanyDetails) => void;
  updateCompany: (data: Partial<CompanyDetails>) => void;
  setLetter: (letter: LetterContent) => void;
  updateLetter: (data: Partial<LetterContent>) => void;
  setProposal: (proposal: ProposalContent) => void;
  updateProposal: (data: Partial<ProposalContent>) => void;
  setStyle: (style: StyleConfig) => void;
  updateStyle: (data: Partial<StyleConfig>) => void;
  setDocumentTitle: (title: string) => void;

  // Page actions
  setPages: (pages: PageConfig[]) => void;
  addPage: (page: PageConfig) => void;
  removePage: (id: string) => void;
  duplicatePage: (id: string) => void;
  reorderPages: (from: number, to: number) => void;
  setActivePage: (id: string | null) => void;

  // Canvas actions
  selectElement: (id: string) => void;
  addToSelection: (id: string) => void;
  deselectAll: () => void;
  updateElement: (pageId: string, element: CanvasElement) => void;
  addElement: (pageId: string, element: CanvasElement) => void;
  removeElement: (pageId: string, elementId: string) => void;
  setZoom: (zoom: number) => void;
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;

  // UI actions
  setActiveSidebarTab: (tab: string) => void;
  setSidebarWidth: (width: number) => void;
  toggleTheme: () => void;
  addNotification: (notification: Omit<AppNotification, 'id'>) => void;
  removeNotification: (id: string) => void;

  // History actions
  pushUndo: (state: any) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Reset
  reset: () => void;
}

const defaultCompany: CompanyDetails = {
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
};

const defaultLetter: LetterContent = {
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
};

const defaultProposal: ProposalContent = {
  projectTitle: 'Enterprise Cloud Ingress & Database Optimization Framework',
  objectives: '',
  requirements: '',
  budgetItems: [{ id: 'item-1', description: 'Cloud Infrastructure Architecture & VPC Isolation', quantity: 1, unitPrice: 2450 }],
  taxRate: 8,
  currencySymbol: '$',
  notes: '',
};

const defaultStyle: StyleConfig = {
  theme: 'modern-split',
  fontPair: 'modern',
  primaryColor: '#0f172a',
  secondaryColor: '#4f46e5',
  textColor: '#1e293b',
  paperBackground: 'solid-white',
  watermarkText: 'CONFIDENTIAL',
  showWatermark: true,
  accentBarPosition: 'top',
};

export const useStore = create<AppStore>()(
  subscribeWithSelector(
  persist(
    (set, get) => ({
      // Document state
      docMode: 'letter' as DocumentMode,
      category: 'letter' as DocumentCategory,
      company: { ...defaultCompany },
      letter: { ...defaultLetter },
      proposal: { ...defaultProposal },
      style: { ...defaultStyle },
      documentTitle: 'Untitled Document',
      isDirty: false,

      // Multi-page
      pages: [],
      activePageId: null,

      // Canvas
      selectedElementIds: [],
      canvasViewport: { x: 0, y: 0, zoom: 0.75 },
      showGrid: false,
      snapToGrid: true,
      gridSize: 10,

      // UI
      activeSidebarTab: 'design',
      sidebarWidth: 380,
      themeMode: 'dark',
      notifications: [],

      // History
      undoStack: [],
      redoStack: [],
      maxHistory: 50,

      // Document actions
      setDocMode: (mode) => set({ docMode: mode, isDirty: true }),
      setCategory: (cat) => set({ category: cat, isDirty: true }),
      setCompany: (company) => set({ company, isDirty: true }),
      updateCompany: (data) => set((s) => ({ company: { ...s.company, ...data }, isDirty: true })),
      setLetter: (letter) => set({ letter, isDirty: true }),
      updateLetter: (data) => set((s) => ({ letter: { ...s.letter, ...data }, isDirty: true })),
      setProposal: (proposal) => set({ proposal, isDirty: true }),
      updateProposal: (data) => set((s) => ({ proposal: { ...s.proposal, ...data }, isDirty: true })),
      setStyle: (style) => set({ style, isDirty: true }),
      updateStyle: (data) => set((s) => ({ style: { ...s.style, ...data }, isDirty: true })),
      setDocumentTitle: (title) => set({ documentTitle: title }),

      // Page actions
      setPages: (pages) => set({ pages }),
      addPage: (page) => set((s) => ({ pages: [...s.pages, page] })),
      removePage: (id) => set((s) => ({
        pages: s.pages.filter((p) => p.id !== id),
        activePageId: s.activePageId === id ? null : s.activePageId,
      })),
      duplicatePage: (id) => set((s) => {
        const page = s.pages.find((p) => p.id === id);
        if (!page) return s;
        const dup: PageConfig = { ...page, id: `page-${Date.now()}` };
        return { pages: [...s.pages, dup] };
      }),
      reorderPages: (from, to) => set((s) => {
        const pages = [...s.pages];
        const [moved] = pages.splice(from, 1);
        pages.splice(to, 0, moved);
        return { pages };
      }),
      setActivePage: (id) => set({ activePageId: id }),

      // Canvas actions
      selectElement: (id) => set({ selectedElementIds: [id] }),
      addToSelection: (id) => set((s) => ({
        selectedElementIds: s.selectedElementIds.includes(id) ? s.selectedElementIds : [...s.selectedElementIds, id],
      })),
      deselectAll: () => set({ selectedElementIds: [] }),
      updateElement: (pageId, element) => set((s) => ({
        pages: s.pages.map((p) =>
          p.id === pageId
            ? { ...p, elements: p.elements.map((e) => (e.id === element.id ? element : e)) }
            : p
        ),
        isDirty: true,
      })),
      addElement: (pageId, element) => set((s) => ({
        pages: s.pages.map((p) =>
          p.id === pageId ? { ...p, elements: [...p.elements, element] } : p
        ),
        isDirty: true,
      })),
      removeElement: (pageId, elementId) => set((s) => ({
        pages: s.pages.map((p) =>
          p.id === pageId
            ? { ...p, elements: p.elements.filter((e) => e.id !== elementId) }
            : p
        ),
        selectedElementIds: s.selectedElementIds.filter((id) => id !== elementId),
        isDirty: true,
      })),
      setZoom: (zoom) => set((s) => ({ canvasViewport: { ...s.canvasViewport, zoom: Math.max(0.25, Math.min(4, zoom)) } })),
      setViewport: (viewport) => set((s) => ({ canvasViewport: { ...s.canvasViewport, ...viewport } })),
      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

      // UI actions
      setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(280, Math.min(600, width)) }),
      toggleTheme: () => set((s) => ({ themeMode: s.themeMode === 'dark' ? 'light' : 'dark' })),
      addNotification: (notification) => set((s) => ({
        notifications: [...s.notifications, { ...notification, id: `n-${Date.now()}` }],
      })),
      removeNotification: (id) => set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      })),

      // History actions - uses snapshot diffing for memory efficiency
      pushUndo: (state) => set((s) => {
        const snapshot = JSON.parse(JSON.stringify(state));
        return {
          undoStack: [...s.undoStack.slice(-s.maxHistory + 1), snapshot],
          redoStack: [],
        };
      }),
      undo: () => set((s) => {
        if (s.undoStack.length === 0) return s;
        const prev = s.undoStack[s.undoStack.length - 1];
        const currentSnapshot = { company: s.company, letter: s.letter, proposal: s.proposal, style: s.style, pages: s.pages };
        return {
          ...prev,
          undoStack: s.undoStack.slice(0, -1),
          redoStack: [...s.redoStack.slice(-s.maxHistory + 1), currentSnapshot],
        };
      }),
      redo: () => set((s) => {
        if (s.redoStack.length === 0) return s;
        const next = s.redoStack[s.redoStack.length - 1];
        const currentSnapshot = { company: s.company, letter: s.letter, proposal: s.proposal, style: s.style, pages: s.pages };
        return {
          ...next,
          redoStack: s.redoStack.slice(0, -1),
          undoStack: [...s.undoStack.slice(-s.maxHistory + 1), currentSnapshot],
        };
      }),
      canUndo: () => get().undoStack.length > 0,
      canRedo: () => get().redoStack.length > 0,

      // Reset
      reset: () => set({
        docMode: 'letter',
        category: 'letter',
        company: { ...defaultCompany },
        letter: { ...defaultLetter },
        proposal: { ...defaultProposal },
        style: { ...defaultStyle },
        documentTitle: 'Untitled Document',
        isDirty: false,
        pages: [],
        activePageId: null,
        selectedElementIds: [],
        undoStack: [],
        redoStack: [],
      }),
    }),
    {
      name: 'business-document-studio',
      partialize: (state) => ({
        company: state.company,
        style: state.style,
        themeMode: state.themeMode,
        sidebarWidth: state.sidebarWidth,
      }),
    }
  )
)
);
