import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { BrandKit, BrandCompanyDetails, BrandColors, BrandFonts, BrandAssets } from '../types/brand-kit';

interface BrandKitState {
  kits: BrandKit[];
  activeKitId: string | null;
  isLoading: boolean;
}

type BrandKitAction =
  | { type: 'SET_KITS'; payload: BrandKit[] }
  | { type: 'ADD_KIT'; payload: BrandKit }
  | { type: 'UPDATE_KIT'; payload: { id: string; data: Partial<BrandKit> } }
  | { type: 'REMOVE_KIT'; payload: string }
  | { type: 'SET_ACTIVE_KIT'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_KIT_INTO_COMPANY' };

const initialState: BrandKitState = {
  kits: [],
  activeKitId: null,
  isLoading: false,
};

function brandKitReducer(state: BrandKitState, action: BrandKitAction): BrandKitState {
  switch (action.type) {
    case 'SET_KITS':
      return { ...state, kits: action.payload, isLoading: false };
    case 'ADD_KIT':
      return { ...state, kits: [...state.kits, action.payload] };
    case 'UPDATE_KIT':
      return {
        ...state,
        kits: state.kits.map(k => k.id === action.payload.id ? { ...k, ...action.payload.data } : k),
      };
    case 'REMOVE_KIT':
      return {
        ...state,
        kits: state.kits.filter(k => k.id !== action.payload),
        activeKitId: state.activeKitId === action.payload ? null : state.activeKitId,
      };
    case 'SET_ACTIVE_KIT':
      return { ...state, activeKitId: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface BrandKitContextValue {
  state: BrandKitState;
  dispatch: React.Dispatch<BrandKitAction>;
  activeKit: BrandKit | null;
  addKit: (kit: BrandKit) => void;
  updateKit: (id: string, data: Partial<BrandKit>) => void;
  removeKit: (id: string) => void;
  setActiveKit: (id: string | null) => void;
  createDefaultKit: (name: string) => BrandKit;
}

const BrandKitContext = createContext<BrandKitContextValue | undefined>(undefined);

export function BrandKitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(brandKitReducer, initialState);

  const activeKit = state.activeKitId ? state.kits.find(k => k.id === state.activeKitId) || null : null;

  const addKit = useCallback((kit: BrandKit) => dispatch({ type: 'ADD_KIT', payload: kit }), []);
  const updateKit = useCallback((id: string, data: Partial<BrandKit>) => dispatch({ type: 'UPDATE_KIT', payload: { id, data } }), []);
  const removeKit = useCallback((id: string) => dispatch({ type: 'REMOVE_KIT', payload: id }), []);
  const setActiveKit = useCallback((id: string | null) => dispatch({ type: 'SET_ACTIVE_KIT', payload: id }), []);

  const createDefaultKit = useCallback((name: string): BrandKit => ({
    id: `brand-${Date.now()}`,
    name,
    company: {
      name: 'Your Company Name',
      tagline: 'Your Tagline',
      logoType: 'initials',
      logoInitials: 'YC',
      addressLine1: '123 Business St',
      addressLine2: 'Suite 100',
      phone: '+1 (555) 123-4567',
      email: 'contact@company.com',
      website: 'company.com',
    },
    colors: { primary: '#0f172a', secondary: '#4f46e5', accent: '#d97706', text: '#1e293b', background: '#ffffff' },
    fonts: { heading: 'Inter', body: 'Inter', meta: 'Inter' },
    assets: {},
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDefault: false },
  }), []);

  return (
    <BrandKitContext.Provider value={{ state, dispatch, activeKit, addKit, updateKit, removeKit, setActiveKit, createDefaultKit }}>
      {children}
    </BrandKitContext.Provider>
  );
}

export function useBrandKit() {
  const ctx = useContext(BrandKitContext);
  if (!ctx) throw new Error('useBrandKit must be used within BrandKitProvider');
  return ctx;
}
