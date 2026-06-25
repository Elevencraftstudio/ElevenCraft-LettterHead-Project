import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { Template, TemplateCategory } from '../types/template';
import { DocumentCategory } from '../types/document';
import { TEMPLATES } from '../constants/templates';

interface TemplateState {
  templates: Template[];
  favorites: string[];
  recentlyUsed: string[];
  searchQuery: string;
  activeFilter: TemplateCategory;
  activeDocType: DocumentCategory | 'all';
}

type TemplateAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTER'; payload: TemplateCategory }
  | { type: 'SET_DOC_TYPE'; payload: DocumentCategory | 'all' }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'ADD_RECENT'; payload: string }
  | { type: 'SET_TEMPLATES'; payload: Template[] };

const initialState: TemplateState = {
  templates: TEMPLATES,
  favorites: JSON.parse(localStorage.getItem('template-favorites') || '[]'),
  recentlyUsed: JSON.parse(localStorage.getItem('template-recent') || '[]'),
  searchQuery: '',
  activeFilter: 'all',
  activeDocType: 'all',
};

function persistFavorites(favorites: string[]) {
  localStorage.setItem('template-favorites', JSON.stringify(favorites));
}

function persistRecent(recent: string[]) {
  localStorage.setItem('template-recent', JSON.stringify(recent.slice(0, 20)));
}

function templateReducer(state: TemplateState, action: TemplateAction): TemplateState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'SET_DOC_TYPE':
      return { ...state, activeDocType: action.payload };
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.includes(action.payload);
      const favorites = exists
        ? state.favorites.filter(id => id !== action.payload)
        : [...state.favorites, action.payload];
      persistFavorites(favorites);
      return { ...state, favorites };
    }
    case 'ADD_RECENT': {
      const recentlyUsed = [action.payload, ...state.recentlyUsed.filter(id => id !== action.payload)];
      persistRecent(recentlyUsed);
      return { ...state, recentlyUsed };
    }
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    default:
      return state;
  }
}

interface TemplateContextValue {
  state: TemplateState;
  dispatch: React.Dispatch<TemplateAction>;
  filteredTemplates: Template[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  addRecent: (id: string) => void;
  setSearch: (q: string) => void;
  setFilter: (f: TemplateCategory) => void;
  setDocType: (d: DocumentCategory | 'all') => void;
  getTemplateById: (id: string) => Template | undefined;
}

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(templateReducer, initialState);

  const isFavorite = useCallback((id: string) => state.favorites.includes(id), [state.favorites]);
  const toggleFavorite = useCallback((id: string) => dispatch({ type: 'TOGGLE_FAVORITE', payload: id }), []);
  const addRecent = useCallback((id: string) => dispatch({ type: 'ADD_RECENT', payload: id }), []);
  const setSearch = useCallback((q: string) => dispatch({ type: 'SET_SEARCH', payload: q }), []);
  const setFilter = useCallback((f: TemplateCategory) => dispatch({ type: 'SET_FILTER', payload: f }), []);
  const setDocType = useCallback((d: DocumentCategory | 'all') => dispatch({ type: 'SET_DOC_TYPE', payload: d }), []);
  const getTemplateById = useCallback((id: string) => state.templates.find(t => t.id === id), [state.templates]);

  const filteredTemplates = useMemo(() => {
    let result = state.templates;

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (state.activeFilter !== 'all') {
      result = result.filter(t => t.category === state.activeFilter);
    }

    if (state.activeDocType !== 'all') {
      result = result.filter(t => t.documentType === state.activeDocType);
    }

    return result;
  }, [state.templates, state.searchQuery, state.activeFilter, state.activeDocType]);

  return (
    <TemplateContext.Provider value={{ state, dispatch, filteredTemplates, isFavorite, toggleFavorite, addRecent, setSearch, setFilter, setDocType, getTemplateById }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplates must be used within TemplateProvider');
  return ctx;
}
