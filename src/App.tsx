import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Printer, Sparkles, RotateCcw, Upload, Palette, Layout, Type, Check, FileText,
  Signature, Briefcase, Trash2, ExternalLink, ChevronRight, ZoomIn, ZoomOut,
  Sliders, Bookmark, Plus, Coins, DollarSign, LogIn, LogOut, Save, Database, Cloud,
  Grid3X3, Image, History, Share2, Download, Layers, Stamp, QrCode, Settings as SettingsIcon, X, Undo2, Redo2, PanelRight
} from 'lucide-react';
import { CompanyDetails, LetterContent, StyleConfig, LayoutTheme, ProposalContent, DocumentMode, BudgetLineItem } from './types';
import { DocumentProvider, useDocument } from './contexts/DocumentContext';
import { BrandKitProvider, useBrandKit } from './contexts/BrandKitContext';
import { TemplateProvider, useTemplates } from './contexts/TemplateContext';
import { LOGO_PRESETS } from './components/LogoPresets';
import { SignaturePad } from './components/SignaturePad';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { BackgroundLibrary, BACKGROUND_PRESETS } from './features/backgrounds/BackgroundLibrary';
import { CommandPalette, useDefaultCommands } from './components/editor/CommandPalette';
import { ToastNotifications } from './components/editor/ToastNotifications';
import { ShortcutProvider, ShortcutHelpDialog } from './components/shortcuts';
import { getShortcutManager } from './services/keyboard';
import { getAIService } from './services/ai-service';
import { exportDocument, ExportFormat } from './services/export-service';
import type { ExportDocumentModel } from './export/types';
import { useDesignHistory } from './hooks/useDesignHistory';
import { useOffline, recoveryManager } from './offline';
import { applyUpdate } from './offline/swUpdate';
import { useStore } from './store';
import { getAllProjects, saveProject, deleteProject, ProjectRecord } from './storage/projects';

const LazyAssets = lazy(() => import('./features/asset-manager/EnhancedAssetManager').then((m) => ({ default: m.EnhancedAssetManager })));
const LazyAIAssistant = lazy(() => import('./features/ai-assistant/AIAssistant').then((m) => ({ default: m.AIAssistant })));
const LazyPageManager = lazy(() => import('./features/multi-page/PageManager').then((m) => ({ default: m.PageManager })));
const LazySmartComponents = lazy(() => import('./features/smart-components/SmartComponents').then((m) => ({ default: m.SmartComponents })));
const LazyCanvasEditor = lazy(() => import('./components/editor/CanvasEditor').then((m) => ({ default: m.CanvasEditor })));
const LazyLetterheadCanvas = lazy(() => import('./components/LetterheadCanvas').then((m) => ({ default: m.LetterheadCanvas })));
const LazyTemplateGallery = lazy(() => import('./features/templates/TemplateGallery').then((m) => ({ default: m.TemplateGallery })));
const LazyBrandKitManager = lazy(() => import('./features/brand-kit/BrandKitManager').then((m) => ({ default: m.BrandKitManager })));
const LazyQRCodeGenerator = lazy(() => import('./features/qr-code/QRCodeGenerator').then((m) => ({ default: m.QRCodeGenerator })));
const LazyStampBuilder = lazy(() => import('./features/stamp/StampBuilder').then((m) => ({ default: m.StampBuilder })));
const LazyThemeBuilder = lazy(() => import('./features/theme-builder/ThemeBuilder').then((m) => ({ default: m.ThemeBuilder })));
const LazyLayersPanel = lazy(() => import('./features/layers/LayersPanel').then((m) => ({ default: m.LayersPanel })));
const LazyPropertyInspector = lazy(() => import('./features/inspector/PropertyInspector').then((m) => ({ default: m.PropertyInspector })));
const LazyExportWizard = lazy(() => import('./components/editor/ExportWizard').then((m) => ({ default: m.ExportWizard })));

function PanelFallback() { return <div className="space-y-4 p-5 animate-pulse"><div className="h-4 w-24 bg-slate-800 rounded" /><div className="h-8 w-full bg-slate-800/50 rounded-lg" /><div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 w-full bg-slate-800/30 rounded-lg" />)}</div></div>; }

const PRESET_LETTER_TEMPLATES = [
  {
    id: 'partnership',
    label: 'Partnership Notice',
    subject: 'Executive Collaboration & Integration Venture Framework',
    salutation: 'Dear Dr. Parker,',
    body: `We are pleased to submit this official notice regarding the upcoming structural integration and partner framework optimization between Stellar Solutions Inc. and Innovatech Global Laboratories.\n\nOur technical assessment team has completed their first phase of evaluating your laboratory instrumentation controls. We are confident that our proprietary cloud-native framework will improve operational efficiency by up to thirty-four percent within the upcoming quarter.\n\nEnclosed in this packet, please find the standard terms of service, draft deployment schedules, and resource matrix documents designed to facilitate a smooth, uninterrupted onboarding cycle.\n\nWe look forward to collaborating closely with your enterprise architecture team. Please do not hesitate to contact our executive support line directly if you require any secondary technical briefings or coordination meetings.`,
    closing: 'Sincerely and warm regards,'
  },
  {
    id: 'thankyou',
    label: 'Client Thank You',
    subject: 'Expressing Appreciation for Our Continued Strategic Enterprise Alliance',
    salutation: 'Dear Mr. Henderson,',
    body: `On behalf of our entire leadership group at Stellar Solutions, I would like to express our deep appreciation for your partnership during the migration of your core transaction systems this past month.\n\nYour engineering staff showed exceptional competence and structural focus, resolving cross-platform routing loops in record time. It is a rare pleasure to work side-by-side with a team so dedicated to technical perfection.\n\nAs we look toward the second half of our fiscal partnership roadmaps, we are eager to introduce additional optimization patterns that will solidify your infrastructure limits and provide long-term systems reliability.\n\nPlease accept our warmest gratitude and we look forward to achieving further milestones together.`,
    closing: 'With highest regards,'
  },
  {
    id: 'notice',
    label: 'Service Level Agreement Notice',
    subject: 'Notification of Systems Optimization & Schedule of Quarterly Maintenance',
    salutation: 'To our Valued Enterprise Clients,',
    body: `This letter serves as an official notice concerning scheduled systems optimization and preventative server-array cycles for all core cluster infrastructure scheduled for execution in July 2026.\n\nOur engineers will undergo targeted data-routing upgrades to ensure sustained reliability and defense indexes across all localized nodes. Expected localized latency fluctuations of up to three minutes may occur during the operations window.\n\nNo proactive customer intervention is necessary. We apologize for any minor disruptions this operational cycle might induce, and we thank you for your patience as we reinforce our service level standard.`,
    closing: 'Cordially,'
  },
  {
    id: 'blank',
    label: 'Clean Sheet / Draft',
    subject: 'RE: Your Customized Subject Line Goes Here',
    salutation: 'Dear Recipient Name,',
    body: `This is your official business correspondence space. Double-click or type in the inputs in the letter panel to draft or adjust this message immediately. Supported A4 templates automatically paginate your document content so it fits cleanly on physical letter sheets when printed.`,
    closing: 'Warmest regards,'
  }
];

const ACCENT_COLORS = [
  { name: 'Slate Onyx', primary: '#0f172a', secondary: '#4f46e5' },
  { name: 'Forest Moss', primary: '#14532d', secondary: '#d97706' },
  { name: 'Regal Bordeaux', primary: '#701a20', secondary: '#b58a3a' },
  { name: 'Classic Navy', primary: '#1e3a8a', secondary: '#eab308' },
  { name: 'Teal Sage', primary: '#0d9488', secondary: '#64748b' },
  { name: 'Nordic Charcoal', primary: '#111827', secondary: '#e2e8f0' }
];

type DashboardView = 'design' | 'brand' | 'content' | 'style' | 'templates' | 'assets' | 'qr' | 'stamp' | 'layers' | 'pages' | 'components' | 'history' | 'ai' | 'export' | 'share' | 'settings';

function AppContent() {
  const { state: docState, dispatch, updateCompany, updateLetter, updateProposal, updateStyle, setDocMode, setCategory } = useDocument();
  const { state: brandState, activeKit, setActiveKit } = useBrandKit();
  const { filteredTemplates, getTemplateById } = useTemplates();
  const designHistory = useDesignHistory(docState, { maxEntries: 50 });

  const [activeTab, setActiveTab] = useState<DashboardView>('design');
  const [previewScale, setPreviewScale] = useState<number>(0.75);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showStampBuilder, setShowStampBuilder] = useState(false);
  const [canvasMode, setCanvasMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { hasRecovery, recover: doRecover, dismissRecovery } = useOffline();
  const [showRecovery, setShowRecovery] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showExportWizard, setShowExportWizard] = useState(false);

  const exportModel: ExportDocumentModel = useMemo(() => ({
    title: docState.documentTitle || 'document',
    docMode: docState.docMode,
    company: docState.company as unknown as Record<string, unknown>,
    letter: docState.letter as unknown as Record<string, unknown>,
    proposal: docState.proposal as unknown as Record<string, unknown>,
    style: docState.style as unknown as Record<string, unknown>,
  }), [docState]);

  useEffect(() => {
    if (hasRecovery) {
      const dismissed = sessionStorage.getItem('recovery-dismissed');
      if (!dismissed) setShowRecovery(true);
    }
  }, [hasRecovery]);

  const addNotification = useStore((s) => s.addNotification);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as CustomEvent;
      if (event.detail?.type === 'SW_UPDATED') {
        setUpdateAvailable(true);
        addNotification({ type: 'info', message: 'A new version is available. Refresh to update.', duration: 8000 });
      }
    };
    window.addEventListener('sw-update', handler);
    return () => window.removeEventListener('sw-update', handler);
  }, [addNotification]);

  // Local documents — fully offline, stored in IndexedDB (no cloud / no auth)
  const [savedDocs, setSavedDocs] = useState<ProjectRecord[]>([]);
  const [documentSaveTitle, setDocumentSaveTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const refreshLocalDocs = async () => {
    try { setSavedDocs(await getAllProjects()); } catch { /* ignore */ }
  };

  useEffect(() => { void refreshLocalDocs(); }, []);

  const handleSaveDocument = async (customTitle?: string) => {
    const titleToUse = customTitle || documentSaveTitle || docState.documentTitle || `Document ${new Date().toLocaleDateString()}`;
    setIsSaving(true);
    try {
      const snapshot = {
        company: docState.company, letter: docState.letter, proposal: docState.proposal,
        style: docState.style, pages: docState.pages, documentTitle: titleToUse,
        docMode: docState.docMode, category: docState.category,
      };
      const id = titleToUse.toLowerCase().replace(/\s+/g, '-') || 'untitled';
      await saveProject({
        id, title: titleToUse, docMode: docState.docMode, category: docState.category,
        data: snapshot as unknown as Record<string, unknown>,
        createdAt: Date.now(), updatedAt: Date.now(),
      });
      setDocumentSaveTitle('');
      await refreshLocalDocs();
      addNotification({ type: 'success', message: `Saved "${titleToUse}" locally`, duration: 2500 });
    } catch {
      addNotification({ type: 'error', message: 'Failed to save document', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDocument = (savedDoc: ProjectRecord) => {
    const d = savedDoc.data as Record<string, any>;
    dispatch({ type: 'LOAD_DOCUMENT', payload: {
      company: d.company, letter: d.letter, proposal: d.proposal, style: d.style,
      pages: d.pages, documentTitle: d.documentTitle ?? savedDoc.title,
      docMode: d.docMode, category: d.category,
    } });
    addNotification({ type: 'info', message: `Loaded "${savedDoc.title}"`, duration: 2000 });
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteProject(id);
      await refreshLocalDocs();
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setPreviewScale(0.38);
      else if (window.innerWidth < 1024) setPreviewScale(0.55);
      else if (window.innerWidth < 1440) setPreviewScale(0.68);
      else setPreviewScale(0.78);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mgr = getShortcutManager();
    const unreg = mgr.register({
      id: 'command-palette',
      keys: 'Ctrl+K',
      scope: 'global',
      description: 'Toggle command palette',
      category: 'General',
      action: () => setCommandPaletteOpen((prev) => !prev),
    });
    return () => unreg();
  }, []);

  const applyColorPreset = (primary: string, secondary: string) => {
    updateStyle({ primaryColor: primary, secondaryColor: secondary });
  };

  const loadPresetLetter = (presetId: string) => {
    const preset = PRESET_LETTER_TEMPLATES.find(p => p.id === presetId);
    if (preset) updateLetter({ subject: preset.subject, salutation: preset.salutation, body: preset.body, closing: preset.closing });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert("The uploaded logo image is too large. Please select a graphic file under 2MB."); return; }
      const reader = new FileReader();
      reader.onload = () => updateCompany({ logoType: 'upload', logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSignature = (dataUrl: string) => {
    updateLetter({ signatureType: 'draw', signatureDrawing: dataUrl });
  };

  const handleClearSignature = () => {
    updateLetter({ signatureType: 'none', signatureDrawing: '' });
  };

  const triggerPrintLetter = () => window.print();

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      updateCompany(template.company);
      updateStyle(template.style);
      setShowTemplateGallery(false);
    }
  };

  const handleAIWrite = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    const ai = getAIService();
    const result = await ai.generate(aiPrompt, `Write a professional business ${docState.docMode}`);
    if (result.success) {
      updateLetter({ body: result.content });
      setAiResult(result.content);
    }
    setAiLoading(false);
  };

  const handleExport = async (format: ExportFormat) => {
    const el = document.getElementById('letterhead-print-canvas');
    await exportDocument(el, { format, fileName: docState.documentTitle || 'document' });
  };

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'design':
        return <DesignPanel />;
      case 'brand':
        return <BrandPanel />;
      case 'content':
        return <ContentPanel />;
      case 'style':
        return <StylePanel />;
      case 'templates':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Templates</h3>
              <button onClick={() => setShowTemplateGallery(true)} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                Browse All
              </button>
            </div>
            <div className="space-y-2">
              {filteredTemplates.slice(0, 6).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t.id)}
                  className="w-full text-left bg-slate-900/40 border border-slate-800 rounded-xl p-3 hover:border-indigo-500/40 transition cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-200">{t.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t.description}</p>
                  <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 mt-1 inline-block">
                    {t.category}
                  </span>
                </button>
              ))}
            </div>
            <Suspense fallback={<PanelFallback />}><LazyThemeBuilder /></Suspense>
          </div>
        );
      case 'assets':
        return <Suspense fallback={<PanelFallback />}><LazyAssets /></Suspense>;
      case 'qr':
        return (
          <Suspense fallback={<PanelFallback />}>
            <LazyQRCodeGenerator
              onGenerate={(dataUrl, config) => {
                console.log('QR Generated:', dataUrl, config);
                setShowQRGenerator(false);
              }}
              onClose={() => setShowQRGenerator(false)}
            />
          </Suspense>
        );
      case 'stamp':
        return (
          <Suspense fallback={<PanelFallback />}>
            <LazyStampBuilder
              onSave={(dataUrl, config) => {
                console.log('Stamp Generated:', dataUrl, config);
                setShowStampBuilder(false);
              }}
            />
          </Suspense>
        );
      case 'layers':
        return <Suspense fallback={<PanelFallback />}><LazyLayersPanel /></Suspense>;
      case 'pages':
        return <Suspense fallback={<PanelFallback />}><LazyPageManager /></Suspense>;
      case 'components':
        return <Suspense fallback={<PanelFallback />}><LazySmartComponents /></Suspense>;
      case 'history':
        return <HistoryPanel />;
      case 'ai':
        return <Suspense fallback={<PanelFallback />}><LazyAIAssistant /></Suspense>;
      case 'export':
        return <ExportPanel />;
      case 'share':
        return <SharePanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DesignPanel />;
    }
  };

  // --- Panel sub-components (extracted from existing App.tsx sidebar) ---
  const DesignPanel = () => (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
          <Layout size={16} className="text-indigo-400" />
          <span>Document Design</span>
        </h3>
        <p className="text-xs text-slate-400">Switch between document types and manage your canvas.</p>
      </div>
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
        <label className="text-[10px] uppercase font-bold text-slate-400 block">Document Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setDocMode('letter'); setCategory('letter'); }}
            className={`py-2 text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5 ${
              docState.docMode === 'letter' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={13} /> Standard Letter
          </button>
          <button
            onClick={() => { setDocMode('proposal'); setCategory('proposal'); }}
            className={`py-2 text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5 ${
              docState.docMode === 'proposal' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={13} /> Proposal
          </button>
        </div>
      </div>
      <BackgroundLibrary
        activeBackground={docState.style.paperBackground}
        onSelect={(bg) => updateStyle({ paperBackground: bg.id as any })}
      />
      <Suspense fallback={<div className="h-20 bg-slate-900/30 rounded-xl animate-pulse" />}>
        <LazyBrandKitManager />
      </Suspense>
    </div>
  );

  const BrandPanel = () => (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
          <Briefcase size={16} className="text-indigo-400" />
          <span>Brand Identity</span>
        </h3>
      </div>
      <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Company Name</label>
          <input type="text" value={docState.company.name}
            onChange={e => updateCompany({ name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Tagline</label>
          <input type="text" value={docState.company.tagline}
            onChange={e => updateCompany({ tagline: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Logo</label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-900">
          <button onClick={() => updateCompany({ logoType: 'preset' })}
            className={`py-1.5 text-xs rounded font-medium ${docState.company.logoType === 'preset' ? 'bg-indigo-600/90 text-white' : 'text-slate-400'}`}>Symbols</button>
          <button onClick={() => updateCompany({ logoType: 'initials' })}
            className={`py-1.5 text-xs rounded font-medium ${docState.company.logoType === 'initials' ? 'bg-indigo-600/90 text-white' : 'text-slate-400'}`}>Initials</button>
          <button onClick={() => updateCompany({ logoType: 'upload' })}
            className={`py-1.5 text-xs rounded font-medium ${docState.company.logoType === 'upload' ? 'bg-indigo-600/90 text-white' : 'text-slate-400'}`}>Upload</button>
        </div>
        {docState.company.logoType === 'preset' && (
          <div className="grid grid-cols-2 gap-2">
            {LOGO_PRESETS.map(p => (
              <button key={p.id} onClick={() => updateCompany({ logoPreset: p.id })}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between h-14 transition ${
                  docState.company.logoPreset === p.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/40'
                }`}>
                <span className="text-[11px] font-bold text-slate-200">{p.name}</span>
                <span className="text-[9px] text-slate-500">{p.description}</span>
              </button>
            ))}
          </div>
        )}
        {docState.company.logoType === 'initials' && (
          <input type="text" maxLength={3} value={docState.company.logoInitials || ''}
            onChange={e => updateCompany({ logoInitials: e.target.value.toUpperCase() })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-100"
          />
        )}
        {docState.company.logoType === 'upload' && (
          <div onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 rounded-lg p-3 text-center cursor-pointer hover:border-slate-700 transition">
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <Upload size={20} className="mx-auto text-slate-500 mb-1" />
            <p className="text-xs text-slate-400 font-medium">{docState.company.logoUrl ? "Replace" : "Upload Logo"}</p>
          </div>
        )}
      </div>
      <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2">Contact Details</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Address</label>
            <input type="text" value={docState.company.addressLine1}
              onChange={e => updateCompany({ addressLine1: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">City</label>
            <input type="text" value={docState.company.addressLine2}
              onChange={e => updateCompany({ addressLine2: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Phone</label>
            <input type="text" value={docState.company.phone}
              onChange={e => updateCompany({ phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Email</label>
            <input type="email" value={docState.company.email}
              onChange={e => updateCompany({ email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Website</label>
          <input type="text" value={docState.company.website}
            onChange={e => updateCompany({ website: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
        </div>
      </div>
    </div>
  );

  const ContentPanel = () => (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
          <FileText size={16} className="text-indigo-400" />
          <span>Content</span>
        </h3>
      </div>

      {/* Preset Letters */}
      {docState.docMode === 'letter' && (
        <>
          <div className="bg-slate-900 border border-indigo-900/30 p-4 rounded-xl space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
              <Bookmark size={12} />
              <span>Preset Templates</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LETTER_TEMPLATES.map(p => (
                <button key={p.id} onClick={() => loadPresetLetter(p.id)}
                  className="text-[10px] font-semibold bg-slate-950 border border-slate-800 hover:border-indigo-500/50 px-2.5 py-1.5 rounded-md text-slate-300 hover:text-indigo-300 transition cursor-pointer">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2">Recipient</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                <input type="text" value={docState.letter.recipientName}
                  onChange={e => updateLetter({ recipientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Company</label>
                <input type="text" value={docState.letter.recipientCompany}
                  onChange={e => updateLetter({ recipientCompany: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
              </div>
            </div>
            <textarea rows={2} value={docState.letter.recipientAddress}
              onChange={e => updateLetter({ recipientAddress: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
          </div>

          <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Date</label>
                <input type="text" value={docState.letter.date}
                  onChange={e => updateLetter({ date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Reference</label>
                <input type="text" value={docState.letter.referenceNo || ''}
                  onChange={e => updateLetter({ referenceNo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Subject</label>
              <input type="text" value={docState.letter.subject}
                onChange={e => updateLetter({ subject: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-100" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Salutation</label>
              <input type="text" value={docState.letter.salutation}
                onChange={e => updateLetter({ salutation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
            </div>
          </div>

          <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block">Body</label>
            <textarea rows={10} value={docState.letter.body}
              onChange={e => updateLetter({ body: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-indigo-500" />
          </div>
        </>
      )}

      {docState.docMode === 'proposal' && (
        <>
          <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Project Title</label>
              <input type="text" value={docState.proposal.projectTitle}
                onChange={e => updateProposal({ projectTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-100" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Objectives</label>
              <textarea rows={3} value={docState.proposal.objectives}
                onChange={e => updateProposal({ objectives: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Requirements</label>
              <textarea rows={4} value={docState.proposal.requirements}
                onChange={e => updateProposal({ requirements: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
            </div>
          </div>
          <ProposalBudgetPanel />
        </>
      )}
    </div>
  );

  const ProposalBudgetPanel = () => (
    <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300">Budget</span>
        <button onClick={() => {
          const newItem: BudgetLineItem = { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 };
          updateProposal({ budgetItems: [...docState.proposal.budgetItems, newItem] });
        }} className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition cursor-pointer">
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {docState.proposal.budgetItems.map((item, idx) => (
          <div key={item.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 relative group">
            <input type="text" value={item.description}
              onChange={e => { const u = [...docState.proposal.budgetItems]; u[idx].description = e.target.value; updateProposal({ budgetItems: u }); }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 mb-2" placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min={1} value={item.quantity}
                onChange={e => { const u = [...docState.proposal.budgetItems]; u[idx].quantity = Math.max(1, parseInt(e.target.value) || 1); updateProposal({ budgetItems: u }); }}
                className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 text-center" />
              <input type="number" min={0} step={1} value={item.unitPrice}
                onChange={e => { const u = [...docState.proposal.budgetItems]; u[idx].unitPrice = Math.max(0, parseFloat(e.target.value) || 0); updateProposal({ budgetItems: u }); }}
                className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 text-right" />
            </div>
            <button onClick={() => updateProposal({ budgetItems: docState.proposal.budgetItems.filter(bi => bi.id !== item.id) })}
              className="absolute top-2 right-2 text-slate-600 hover:text-red-400 transition cursor-pointer">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-850">
        <select value={docState.proposal.currencySymbol}
          onChange={e => updateProposal({ currencySymbol: e.target.value })}
          className="bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200">
          <option value="$">USD ($)</option>
          <option value="€">EUR (€)</option>
          <option value="£">GBP (£)</option>
          <option value="¥">JPY (¥)</option>
        </select>
        <input type="number" min={0} max={100} value={docState.proposal.taxRate}
          onChange={e => updateProposal({ taxRate: Math.max(0, parseInt(e.target.value) || 0) })}
          className="bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 text-center" placeholder="Tax %" />
      </div>
      <textarea rows={2} value={docState.proposal.notes || ''}
        onChange={e => updateProposal({ notes: e.target.value })}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" placeholder="Notes" />
    </div>
  );

  const StylePanel = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
        <Layout size={16} className="text-indigo-400" />
        <span>Layout & Style</span>
      </h3>

      {/* Layout Themes */}
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Layout Theme</label>
        {[
          { id: 'classic-top', name: 'Classic Top Header' },
          { id: 'modern-split', name: 'Modern Split' },
          { id: 'side-ribbon', name: 'Side Ribbon' },
          { id: 'minimalist-clean', name: 'Minimalist' },
          { id: 'creative-block', name: 'Creative Block' },
        ].map(theme => (
          <button key={theme.id} onClick={() => updateStyle({ theme: theme.id as LayoutTheme })}
            className={`w-full p-2.5 rounded-xl border text-left transition ${
              docState.style.theme === theme.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/55'
            }`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${docState.style.theme === theme.id ? 'border-indigo-400' : 'border-slate-600'}`}>
                {docState.style.theme === theme.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </div>
              <span className="text-xs font-bold text-slate-200">{theme.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Colors */}
      <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Colors</label>
        <div className="grid grid-cols-2 gap-2">
          {ACCENT_COLORS.map((preset, idx) => (
            <button key={idx} onClick={() => applyColorPreset(preset.primary, preset.secondary)}
              className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                docState.style.primaryColor === preset.primary ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/40'
              }`}>
              <div className="flex gap-0.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full -ml-1 border border-slate-900" style={{ backgroundColor: preset.secondary }} />
              </div>
              <span className="text-xs font-medium text-slate-300 truncate">{preset.name}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Primary</label>
            <input type="color" value={docState.style.primaryColor}
              onChange={e => updateStyle({ primaryColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Accent</label>
            <input type="color" value={docState.style.secondaryColor}
              onChange={e => updateStyle({ secondaryColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Typography</label>
        {[
          { id: 'modern', name: 'Swiss Modern' },
          { id: 'executive', name: 'Executive Classic' },
          { id: 'creative', name: 'Creative' },
          { id: 'minimalist', name: 'Minimalist' },
        ].map(font => (
          <button key={font.id} onClick={() => updateStyle({ fontPair: font.id as any })}
            className={`w-full p-2.5 rounded-lg border text-left transition ${docState.style.fontPair === font.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/40'}`}>
            <span className="text-xs font-bold text-slate-200">{font.name}</span>
          </button>
        ))}
      </div>

      {/* Watermark */}
      <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-bold text-slate-400 cursor-pointer">Watermark</label>
          <input type="checkbox" checked={docState.style.showWatermark}
            onChange={e => updateStyle({ showWatermark: e.target.checked })}
            className="w-4 h-4 text-indigo-500 bg-slate-950 rounded border-slate-800 cursor-pointer" />
        </div>
        {docState.style.showWatermark && (
          <input type="text" value={docState.style.watermarkText || ''}
            onChange={e => updateStyle({ watermarkText: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
        )}
      </div>
    </div>
  );

  const LayersPanel = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
        <Layers size={16} className="text-indigo-400" />
        <span>Layers</span>
      </h3>
      <p className="text-xs text-slate-500">Canvas elements will appear here for drag-and-drop reordering, locking, and visibility control.</p>
      <div className="space-y-1 bg-slate-900/30 p-3 rounded-xl border border-slate-800">
        {['Logo', 'Address', 'Contact', 'Body', 'Signature', 'Footer'].map((layer, i) => (
          <div key={layer} className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
            <div className="w-4 h-4 bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-500">{i + 1}</div>
            <span className="flex-1 text-xs text-slate-300">{layer}</span>
            <button className="text-slate-600 hover:text-slate-300 cursor-pointer"><X size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  const HistoryPanel = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
        <History size={16} className="text-indigo-400" />
        <span>Design History</span>
      </h3>
      <div className="flex gap-2">
        <button onClick={designHistory.undo} disabled={!designHistory.canUndo}
          className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 px-3 py-2 rounded-lg transition cursor-pointer disabled:cursor-not-allowed">
          <Undo2 size={14} /> Undo
        </button>
        <button onClick={designHistory.redo} disabled={!designHistory.canRedo}
          className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 px-3 py-2 rounded-lg transition cursor-pointer disabled:cursor-not-allowed">
          <Redo2 size={14} /> Redo
        </button>
      </div>
      <p className="text-xs text-slate-500">Version history will show saved snapshots for restoration.</p>
      <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 text-center">
        <History size={24} className="mx-auto text-slate-600 mb-2 opacity-50" />
        <p className="text-xs text-slate-500">Auto-save is active. Changes are tracked locally.</p>
      </div>
    </div>
  );

  const AIPanel = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
        <Sparkles size={16} className="text-indigo-400" />
        <span>AI Document Assistant</span>
      </h3>
      <p className="text-xs text-slate-500">Generate professional content with AI. Works with Gemini or OpenAI.</p>
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-slate-400">What do you want to write?</label>
        <textarea rows={4} value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          placeholder="e.g. Write a professional quotation for web development services..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600" />
      </div>
      <button onClick={handleAIWrite} disabled={!aiPrompt.trim() || aiLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed">
        {aiLoading ? (
          <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Generating...</>
        ) : (
          <><Sparkles size={15} /> Generate Content</>
        )}
      </button>
      {aiResult && (
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-6">{aiResult}</p>
        </div>
      )}
    </div>
  );

  const ExportPanel = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
        <Download size={16} className="text-indigo-400" />
        <span>Export</span>
      </h3>
      <div className="space-y-2">
        {[
          { format: 'pdf' as ExportFormat, label: 'PDF Document', desc: 'Print-ready PDF' },
          { format: 'png' as ExportFormat, label: 'PNG Image', desc: 'High-res image' },
          { format: 'jpeg' as ExportFormat, label: 'JPEG Image', desc: 'Compressed photo' },
          { format: 'svg' as ExportFormat, label: 'SVG Vector', desc: 'Scalable vector' },
        ].map(opt => (
          <button key={opt.format} onClick={() => handleExport(opt.format)}
            className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-left hover:border-indigo-500/40 transition cursor-pointer">
            <span className="text-xs font-bold text-slate-200 block">{opt.label}</span>
            <span className="text-[10px] text-slate-500">{opt.desc}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setShowExportWizard(true)}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer">
        <Download size={15} /> Advanced Export…
      </button>
      <button onClick={triggerPrintLetter}
        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer">
        <Printer size={15} /> Print / Browser PDF
      </button>
    </div>
  );

  const SharePanel = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
        <Share2 size={16} className="text-indigo-400" />
        <span>Share & Collaborate</span>
      </h3>
      <p className="text-xs text-slate-500">Export your document to PDF, image, or Word, then share the file however you like.</p>
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <p className="text-xs text-slate-400">This is a fully offline studio — your documents stay on this device. Use <span className="text-indigo-400 font-semibold">Advanced Export</span> to produce a shareable file.</p>
      </div>
    </div>
  );

  const SettingsPanel = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
        <SettingsIcon size={16} className="text-indigo-400" />
        <span>Settings</span>
      </h3>
      <div className="space-y-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 mb-3">Local Documents</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="text" value={documentSaveTitle}
                onChange={e => setDocumentSaveTitle(e.target.value)}
                placeholder="Document title..." className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100" />
              <button onClick={() => handleSaveDocument()} disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer">
                <Save size={14} /> {isSaving ? '...' : 'Save'}
              </button>
            </div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {savedDocs.map((d) => (
                <div key={d.id} onClick={() => handleLoadDocument(d)}
                  className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500/30 cursor-pointer transition">
                  <span className="text-xs text-slate-300 truncate">{d.title}</span>
                  <button onClick={(e) => handleDeleteDocument(d.id, e)}
                    className="text-slate-600 hover:text-red-400 p-1 cursor-pointer">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {savedDocs.length === 0 && <p className="text-xs text-slate-500 text-center py-2">No saved documents yet</p>}
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 mb-3">Offline & Storage</h4>
          {React.createElement(React.lazy(() => import('./components/ui/OfflineSettings').then(m => ({ default: m.OfflineSettings }))), {})}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DashboardLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as DashboardView)} sidebarContent={renderSidebarContent()}>
        {/* Top Toolbar */}
        <header className="bg-slate-950 border-b border-slate-800 py-2.5 px-6 flex items-center justify-between shrink-0" id="letterhead-navigation-bar">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <h1 className="text-sm font-bold text-white">Stationery & Letterhead Designer</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <button onClick={designHistory.undo} disabled={!designHistory.canUndo}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 disabled:opacity-30 transition cursor-pointer disabled:cursor-not-allowed" title="Undo" aria-label="Undo" aria-disabled={!designHistory.canUndo}>
              <Undo2 size={15} aria-hidden="true" />
            </button>
            <button onClick={designHistory.redo} disabled={!designHistory.canRedo}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 disabled:opacity-30 transition cursor-pointer disabled:cursor-not-allowed" title="Redo" aria-label="Redo" aria-disabled={!designHistory.canRedo}>
              <Redo2 size={15} aria-hidden="true" />
            </button>
            {/* Zoom */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg flex items-center px-1 py-0.5 gap-1.5" role="group" aria-label="Preview zoom controls">
              <button onClick={() => setPreviewScale(p => Math.max(0.3, p - 0.05))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" title="Zoom Out" aria-label="Zoom out preview">
                <ZoomOut size={14} aria-hidden="true" />
              </button>
              <span className="w-10 text-center font-mono text-[11px] text-slate-300" aria-live="polite" aria-label={`Preview zoom ${Math.round(previewScale * 100)} percent`}>{Math.round(previewScale * 100)}%</span>
              <button onClick={() => setPreviewScale(p => Math.min(1.2, p + 0.05))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer" title="Zoom In" aria-label="Zoom in preview">
                <ZoomIn size={14} aria-hidden="true" />
              </button>
            </div>
            {/* Canvas Mode toggle */}
            <button onClick={() => setCanvasMode(!canvasMode)}
              className={`font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer ${
                canvasMode
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Canvas Editor"
              aria-label={canvasMode ? 'Switch to preview mode' : 'Switch to canvas editor'}
              aria-pressed={canvasMode}>
              <PanelRight size={15} aria-hidden="true" />
              <span className="hidden sm:inline">{canvasMode ? 'Canvas' : 'Preview'}</span>
            </button>
            {/* Print */}
            <button onClick={triggerPrintLetter}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition cursor-pointer active:scale-98"
              aria-label="Print or export as PDF">
              <Printer size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        {canvasMode ? (
          <section className="flex-1 overflow-hidden relative">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-slate-500 text-sm"><span>Loading canvas...</span></div>}>
              <LazyCanvasEditor />
            </Suspense>
          </section>
        ) : (
          <section className="flex-1 bg-[#0f172a] overflow-auto p-4 lg:p-8 flex justify-center relative"
            style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            <div className="transition-all duration-300 origin-top" style={{ perspective: '1000px' }}>
              <Suspense fallback={<div className="w-[210mm] h-[297mm] bg-white rounded shadow-2xl flex items-center justify-center text-slate-400 text-sm">Loading preview...</div>}>
                <LazyLetterheadCanvas
                  company={docState.company}
                  letter={docState.letter}
                  style={docState.style}
                  scale={previewScale}
                  docMode={docState.docMode}
                  proposal={docState.proposal}
                />
              </Suspense>
            </div>
          </section>
        )}
      </DashboardLayout>

      {/* Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={useDefaultCommands()}
      />
      <ToastNotifications />

      {/* Recovery dialog */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Recovery">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Recover unsaved work?</h2>
            <p className="text-sm text-slate-400 mb-6">
              It looks like the application didn&apos;t close properly. You can restore your last session.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRecovery(false); dismissRecovery(); sessionStorage.setItem('recovery-dismissed', '1'); }}
                className="px-4 py-2 text-sm rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={async () => {
                  const data = await doRecover();
                  if (data) {
                    const store = useStore;
                    const state = data as any;
                    store.setState({
                      company: state.company ?? store.getState().company,
                      letter: state.letter ?? store.getState().letter,
                      proposal: state.proposal ?? store.getState().proposal,
                      style: state.style ?? store.getState().style,
                      pages: state.pages ?? store.getState().pages,
                      documentTitle: state.documentTitle ?? store.getState().documentTitle,
                      docMode: state.docMode ?? store.getState().docMode,
                      canvasViewport: state.canvasViewport ?? store.getState().canvasViewport,
                      activePageId: state.activePageId ?? store.getState().activePageId,
                    });
                    addNotification({ type: 'success', message: 'Session restored successfully', duration: 3000 });
                  }
                  setShowRecovery(false);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update banner */}
      {updateAvailable && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 text-sm">
          <span>An update is available</span>
          <button
            onClick={() => applyUpdate()}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition cursor-pointer text-xs font-medium"
          >
            Refresh
          </button>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="text-white/70 hover:text-white transition cursor-pointer"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Export Wizard */}
      {showExportWizard && (
        <Suspense fallback={<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60"><div className="animate-pulse bg-slate-900 w-[640px] h-[520px] rounded-2xl" /></div>}>
          <LazyExportWizard isOpen={showExportWizard} onClose={() => setShowExportWizard(false)} model={exportModel} />
        </Suspense>
      )}

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><div className="animate-pulse bg-slate-900 w-[600px] h-[500px] rounded-2xl" /></div>}>
          <LazyTemplateGallery onSelectTemplate={handleTemplateSelect} onClose={() => setShowTemplateGallery(false)} />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <DocumentProvider>
      <BrandKitProvider>
        <TemplateProvider>
          <ShortcutProvider devLogging={process.env.NODE_ENV === 'development'}>
            <AppContent />
            <ShortcutHelpDialog />
          </ShortcutProvider>
        </TemplateProvider>
      </BrandKitProvider>
    </DocumentProvider>
  );
}
