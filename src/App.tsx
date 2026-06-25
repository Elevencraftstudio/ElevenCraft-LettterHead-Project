/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Sparkles, 
  RotateCcw, 
  Upload, 
  Palette, 
  Layout, 
  Type, 
  Check, 
  FileText, 
  Signature, 
  Briefcase, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sliders,
  Bookmark,
  Plus,
  Coins,
  DollarSign
} from 'lucide-react';
import { CompanyDetails, LetterContent, StyleConfig, LayoutTheme, ProposalContent, DocumentMode, BudgetLineItem } from './types';
import { LetterheadCanvas } from './components/LetterheadCanvas';
import { LOGO_PRESETS } from './components/LogoPresets';
import { SignaturePad } from './components/SignaturePad';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType, 
  testConnection 
} from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { LogIn, LogOut, Save, Database, Cloud } from 'lucide-react';

// PRESET LETTER TEMPLATES FOR THE USER
const PRESET_LETTER_TEMPLATES = [
  {
    id: 'partnership',
    label: 'Partnership Notice',
    subject: 'Executive Collaboration & Integration Venture Framework',
    salutation: 'Dear Dr. Parker,',
    body: `We are pleased to submit this official notice regarding the upcoming structural integration and partner framework optimization between Stellar Solutions Inc. and Innovatech Global Laboratories.

Our technical assessment team has completed their first phase of evaluating your laboratory instrumentation controls. We are confident that our proprietary cloud-native framework will improve operational efficiency by up to thirty-four percent within the upcoming quarter.

Enclosed in this packet, please find the standard terms of service, draft deployment schedules, and resource matrix documents designed to facilitate a smooth, uninterrupted onboarding cycle.

We look forward to collaborating closely with your enterprise architecture team. Please do not hesitate to contact our executive support line directly if you require any secondary technical briefings or coordination meetings.`,
    closing: 'Sincerely and warm regards,'
  },
  {
    id: 'thankyou',
    label: 'Client Thank You',
    subject: 'Expressing Appreciation for Our Continued Strategic Enterprise Alliance',
    salutation: 'Dear Mr. Henderson,',
    body: `On behalf of our entire leadership group at Stellar Solutions, I would like to express our deep appreciation for your partnership during the migration of your core transaction systems this past month.

Your engineering staff showed exceptional competence and structural focus, resolving cross-platform routing loops in record time. It is a rare pleasure to work side-by-side with a team so dedicated to technical perfection.

As we look toward the second half of our fiscal partnership roadmaps, we are eager to introduce additional optimization patterns that will solidify your infrastructure limits and provide long-term systems reliability.

Please accept our warmest gratitude and we look forward to achieving further milestones together.`,
    closing: 'With highest regards,'
  },
  {
    id: 'notice',
    label: 'Service Level Agreement Notice',
    subject: 'Notification of Systems Optimization & Schedule of Quarterly Maintenance',
    salutation: 'To our Valued Enterprise Clients,',
    body: `This letter serves as an official notice concerning scheduled systems optimization and preventative server-array cycles for all core cluster infrastructure scheduled for execution in July 2026.

Our engineers will undergo targeted data-routing upgrades to ensure sustained reliability and defense indexes across all localized nodes. Expected localized latency fluctuations of up to three minutes may occur during the operations window.

No proactive customer intervention is necessary. We apologize for any minor disruptions this operational cycle might induce, and we thank you for your patience as we reinforce our service level standard.`,
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

// PRESET ACCENT COLORS PAIRS
const ACCENT_COLORS = [
  { name: 'Slate Onyx', primary: '#0f172a', secondary: '#4f46e5' },
  { name: 'Forest Moss', primary: '#14532d', secondary: '#d97706' },
  { name: 'Regal Bordeaux', primary: '#701a20', secondary: '#b58a3a' },
  { name: 'Classic Navy', primary: '#1e3a8a', secondary: '#eab308' },
  { name: 'Teal Sage', primary: '#0d9488', secondary: '#64748b' },
  { name: 'Nordic Charcoal', primary: '#111827', secondary: '#e2e8f0' }
];

export default function App() {
  // Brand identity state
  const [company, setCompany] = useState<CompanyDetails>({
    name: 'Stellar Solutions Inc.',
    tagline: 'Pioneering Corporate Infrastructure & Enterprise Architecture',
    logoType: 'preset',
    logoPreset: 'hexagon',
    logoInitials: 'SS',
    logoUrl: '',
    addressLine1: 'Silicon Hills Tech Park, Ste 402',
    addressLine2: 'Austin, TX 78759',
    phone: '+1 (512) 835-4921',
    email: 'contact@stellarsolutions.com',
    website: 'stellarsolutions.com'
  });

  // Active Document Mode Toggle (Letter vs Project Scope Proposal)
  const [docMode, setDocMode] = useState<DocumentMode>('letter');

  // Proposal Document content state
  const [proposal, setProposal] = useState<ProposalContent>({
    projectTitle: 'Enterprise Cloud Ingress & Database Optimization Framework',
    objectives: 'This document defines the technical milestones, scope details, and budget allocations for completing a highly resilient, isolated container orchestration environment. Our focus includes automatic load balance routing, secure firewalling, and automated CI/CD-based deployments.',
    requirements: 'Deploy multi-region failover containers with cluster routing keys\nEstablish automated CI/CD security pipelines on code triggers\nHarden database access using encrypted transit secret vaults\nConfigure live active replication with automated validation',
    budgetItems: [
      { id: 'item-1', description: 'Cloud Infrastructure Architecture & VPC Isolation', quantity: 1, unitPrice: 2450.00 },
      { id: 'item-2', description: 'Database Replication Setup & High Availability Cluster', quantity: 1, unitPrice: 3800.00 },
      { id: 'item-3', description: 'Automated CI/CD Delivery & Pipeline Hardening', quantity: 2, unitPrice: 1250.00 },
      { id: 'item-4', description: 'Systems Handover Documentation & Acceptance Audit', quantity: 1, unitPrice: 1500.00 }
    ],
    taxRate: 8,
    currencySymbol: '$',
    notes: 'Estimated fee quotations are valid for 60 business days from the document proposal date. Active implementation schedules trigger within 5 business days of contract sign-off.'
  });

  // Letter document content state
  const [letter, setLetter] = useState<LetterContent>({
    recipientName: 'Dr. Eleanor Parker',
    recipientCompany: 'Innovatech Global Laboratories',
    recipientAddress: '980 Innovation Way, Building C\nInvention District\nSan Francisco, CA 94107',
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    referenceNo: 'LHD-2026-XP92',
    subject: 'Executive Collaboration & Integration Venture Framework',
    salutation: 'Dear Dr. Parker,',
    body: PRESET_LETTER_TEMPLATES[0].body,
    closing: 'Sincerely and warm regards,',
    senderName: 'Arthur Vance',
    senderTitle: 'Chief Integration Officer',
    signatureType: 'type',
    signatureText: 'Arthur Vance',
    signatureDrawing: ''
  });

  // Stationery layout configs
  const [style, setStyle] = useState<StyleConfig>({
    theme: 'modern-split',
    fontPair: 'modern',
    primaryColor: '#0f172a',
    secondaryColor: '#4f46e5',
    textColor: '#1e293b',
    paperBackground: 'solid-white',
    watermarkText: 'CONFIDENTIAL',
    showWatermark: true,
    accentBarPosition: 'top'
  });

  // Workspace configuration controls
  const [activeTab, setActiveTab] = useState<'brand' | 'layout' | 'content' | 'signature' | 'cloud'>('brand');
  const [previewScale, setPreviewScale] = useState<number>(0.75);
  const [isCappingScreen, setIsCappingScreen] = useState<boolean>(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Firebase Auth and Database persistence states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [documentSaveTitle, setDocumentSaveTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeFirebaseDocId, setActiveFirebaseDocId] = useState<string | null>(null);

  // Authenticate using Google login
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Reset loaded document ID and clear states
      setActiveFirebaseDocId(null);
      setSavedDocs([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Test connection on mount and listen to auth changes
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Listen / Fetch user's saved documents when logged in
  useEffect(() => {
    if (!currentUser) {
      setSavedDocs([]);
      return;
    }

    setIsLoadingDocs(true);
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    // Use onSnapshot for real-time synchronization as per Firebase Guidelines
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setSavedDocs(docs);
      setIsLoadingDocs(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documents');
      setIsLoadingDocs(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Save or Update Document in Firestore
  const handleSaveDocument = async (customTitle?: string) => {
    if (!currentUser) return;

    const titleToUse = customTitle || documentSaveTitle || `My Design (${new Date().toLocaleDateString()})`;
    setIsSaving(true);

    const docId = activeFirebaseDocId || doc(collection(db, 'documents')).id;
    const docData: any = {
      id: docId,
      userId: currentUser.uid,
      title: titleToUse,
      docMode,
      company,
      letter,
      proposal,
      style,
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = doc(db, 'documents', docId);
      
      if (!activeFirebaseDocId) {
        // Create new
        await setDoc(docRef, {
          ...docData,
          createdAt: serverTimestamp()
        });
        setActiveFirebaseDocId(docId);
      } else {
        // Update existing (merge with existing)
        await setDoc(docRef, docData, { merge: true });
      }
      
      setDocumentSaveTitle('');
      setIsSaving(false);
    } catch (error) {
      handleFirestoreError(error, activeFirebaseDocId ? OperationType.UPDATE : OperationType.CREATE, `documents/${docId}`);
      setIsSaving(false);
    }
  };

  // Load a document
  const handleLoadDocument = (savedDoc: any) => {
    setActiveFirebaseDocId(savedDoc.id);
    setDocMode(savedDoc.docMode);
    setCompany(savedDoc.company);
    setLetter(savedDoc.letter);
    if (savedDoc.proposal) {
      setProposal(savedDoc.proposal);
    }
    setStyle(savedDoc.style);
  };

  // Delete a document
  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering loading selection
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'documents', id));
      if (activeFirebaseDocId === id) {
        setActiveFirebaseDocId(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `documents/${id}`);
    }
  };

  // Resize listener to optimize initial zoom value for scaling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPreviewScale(0.38); // fit small mobile screens
      } else if (window.innerWidth < 1024) {
        setPreviewScale(0.55); // tablet size
      } else if (window.innerWidth < 1440) {
        setPreviewScale(0.68);
      } else {
        setPreviewScale(0.78);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update layout colors when selecting color presets
  const applyColorPreset = (primary: string, secondary: string) => {
    setStyle(prev => ({
      ...prev,
      primaryColor: primary,
      secondaryColor: secondary
    }));
  };

  // Preset letter body swap
  const loadPresetLetter = (presetId: string) => {
    const preset = PRESET_LETTER_TEMPLATES.find(p => p.id === presetId);
    if (preset) {
      setLetter(prev => ({
        ...prev,
        subject: preset.subject,
        salutation: preset.salutation,
        body: preset.body,
        closing: preset.closing
      }));
    }
  };

  // File logo select action handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("The uploaded logo image is too large. Please select a graphic file under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCompany(prev => ({
          ...prev,
          logoType: 'upload',
          logoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger base64 drawn signature save
  const handleSaveSignature = (dataUrl: string) => {
    setLetter(prev => ({
      ...prev,
      signatureType: 'draw',
      signatureDrawing: dataUrl
    }));
  };

  const handleClearSignature = () => {
    setLetter(prev => ({
      ...prev,
      signatureType: 'none',
      signatureDrawing: ''
    }));
  };

  // Browser Print trigger (designed perfectly with the layout-preserving CSS rules in index.css)
  const triggerPrintLetter = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col" id="applet-viewport">
      
      {/* 1. APP BAR HEADER */}
      <header className="bg-slate-950 border-b border-slate-800 py-3 px-6 h-16 flex items-center justify-between shadow-lg sticky top-0 z-50 no-print" id="letterhead-navigation-bar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Briefcase size={20} className="stroke-2" />
          </div>
          <div>
            <span className="font-semibold text-sm text-slate-300 block leading-tight">BRAND IDENTITY</span>
            <h1 className="text-md font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              Stationery & Letterhead Designer
            </h1>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          {/* Firebase user indicator */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg py-1 pl-1.5 pr-2.5 text-xs text-slate-300">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-5 h-5 rounded-full border border-indigo-500/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 bg-indigo-600/30 text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <span className="font-semibold text-slate-300 truncate max-w-[100px]">
                {currentUser.displayName?.split(' ')[0]}
              </span>
            </div>
          )}

          {/* Zoom Controls (Canvas Utility) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg flex items-center px-1 py-0.5 gap-1.5 text-xs text-slate-300">
            <button 
              onClick={() => setPreviewScale(p => Math.max(0.3, p - 0.05))}
              className="p-1 hover:bg-slate-800 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="w-10 text-center font-mono text-[11px]">
              {Math.round(previewScale * 100)}%
            </span>
            <button 
              onClick={() => setPreviewScale(p => Math.min(1.2, p + 0.05))}
              className="p-1 hover:bg-slate-800 rounded transition"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <button
            onClick={triggerPrintLetter}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all text-nowrap cursor-pointer active:scale-98"
            id="print-letterhead-trigger"
          >
            <Printer size={15} />
            <span>Print or Export PDF</span>
          </button>
        </div>
      </header>

      {/* 2. SPLIT WORKSPACE WRAPPER */}
      <main className="flex-1 flex overflow-hidden lg:flex-row flex-col max-h-[calc(100vh-64px)]">
        
        {/* A. LEFT CONTROLS PANEL (Tabs & Controls) */}
        <aside 
          className="lg:w-[480px] w-full bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto no-print"
          id="letterhead-settings-sidebar"
        >
          {/* Document Work Mode Selector */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Stationery Document Type</span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
              <button
                type="button"
                onClick={() => setDocMode('letter')}
                className={`py-2 text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5 ${
                  docMode === 'letter' 
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <FileText size={13} />
                <span>Standard Letter</span>
              </button>
              <button
                type="button"
                onClick={() => setDocMode('proposal')}
                className={`py-2 text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5 ${
                  docMode === 'proposal' 
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Sparkles size={13} />
                <span>Proposal & Quote</span>
              </button>
            </div>
          </div>

          {/* Section Selector Tab Buttons */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20">
            <button
              onClick={() => setActiveTab('brand')}
              className={`flex-1 py-3 text-center font-semibold text-xs transition relative ${
                activeTab === 'brand' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Briefcase size={14} />
                <span>1. Brand</span>
              </div>
              {activeTab === 'brand' && (
                <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex-1 py-3 text-center font-semibold text-xs transition relative ${
                activeTab === 'layout' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Layout size={14} />
                <span>2. Style</span>
              </div>
              {activeTab === 'layout' && (
                <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 text-center font-semibold text-xs transition relative ${
                activeTab === 'content' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <FileText size={14} />
                <span>3. Content</span>
              </div>
              {activeTab === 'content' && (
                <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('signature')}
              className={`flex-1 py-3 text-center font-semibold text-xs transition relative ${
                activeTab === 'signature' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Signature size={14} />
                <span>4. Signoff</span>
              </div>
              {activeTab === 'signature' && (
                <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className={`flex-1 py-3 text-center font-semibold text-xs transition relative ${
                activeTab === 'cloud' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Cloud size={14} />
                <span>5. Cloud</span>
              </div>
              {activeTab === 'cloud' && (
                <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: BRAND IDENTITY DETAILS */}
              {activeTab === 'brand' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                  key="brand-tab"
                >
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
                      <Briefcase size={16} className="text-indigo-400" />
                      <span>Company Core Brand Identity</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Customize company coordinates below. Changes appear instantly on the physical layout stationery canvas.
                    </p>
                  </div>

                  {/* Company Name & Tagline */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="space-y-1">
                      <label htmlFor="comp-name-input" className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Company Name</label>
                      <input
                        id="comp-name-input"
                        type="text"
                        value={company.name}
                        onChange={e => setCompany(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="comp-tagline-input" className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Corporate Motto / Tagline</label>
                      <input
                        id="comp-tagline-input"
                        type="text"
                        value={company.tagline}
                        onChange={e => setCompany(p => ({ ...p, tagline: e.target.value }))}
                        placeholder="e.g. Innovation in Action"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {/* Logo Config Selection */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block pb-1">Company Logo setup</label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-900 mb-3">
                      <button
                        type="button"
                        onClick={() => setCompany(p => ({ ...p, logoType: 'preset' }))}
                        className={`py-1.5 text-xs rounded font-medium transition ${
                          company.logoType === 'preset' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Symbols
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompany(p => ({ ...p, logoType: 'initials' }))}
                        className={`py-1.5 text-xs rounded font-medium transition ${
                          company.logoType === 'initials' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Initials
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompany(p => ({ ...p, logoType: 'upload' }))}
                        className={`py-1.5 text-xs rounded font-medium transition ${
                          company.logoType === 'upload' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Upload
                      </button>
                    </div>

                    {company.logoType === 'preset' && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Select Symbol Preset:</span>
                        <div className="grid grid-cols-2 gap-2">
                          {LOGO_PRESETS.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setCompany(p => ({ ...p, logoPreset: preset.id }))}
                              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between h-14 transition ${
                                company.logoPreset === preset.id 
                                  ? 'border-indigo-500 bg-indigo-500/10' 
                                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                              }`}
                            >
                              <span className="text-[11px] font-bold text-slate-200">{preset.name}</span>
                              <span className="text-[9px] text-slate-500 line-clamp-1">{preset.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {company.logoType === 'initials' && (
                      <div className="space-y-2">
                        <label htmlFor="logo-initials-input" className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Logo Text Initials</label>
                        <input
                          id="logo-initials-input"
                          type="text"
                          maxLength={3}
                          value={company.logoInitials}
                          onChange={e => setCompany(p => ({ ...p, logoInitials: e.target.value.toUpperCase() }))}
                          placeholder="e.g. SS"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                        />
                      </div>
                    )}

                    {company.logoType === 'upload' && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Upload Custom Logo File</span>
                        <div 
                          onClick={() => logoInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-lg p-3 text-center cursor-pointer bg-slate-950/30 transition group"
                        >
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Upload size={20} className="mx-auto text-slate-500 group-hover:text-slate-300 transition mb-1" />
                          <p className="text-xs text-slate-400 font-medium group-hover:text-slate-200">
                            {company.logoUrl ? "Replace logo image file" : "Select corporate logo file"}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1">PNG, JPG (Square suggested, max 2MB)</p>
                        </div>

                        {company.logoUrl && (
                          <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-850">
                            <img src={company.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded bg-slate-800 p-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-300 font-bold truncate">logo_added.png</p>
                              <p className="text-[10px] text-slate-500">Active logo uploaded</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCompany(p => ({ ...p, logoUrl: '', logoType: 'preset' }))}
                              className="p-1 hover:bg-slate-850 rounded text-red-400 hover:text-red-350 transition"
                              title="Delete uploaded image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contact coordinates & Address details */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2">
                      Office Coordinates
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="address-1-input" className="text-[10px] uppercase font-bold text-slate-400">Address Line 1</label>
                        <input
                          id="address-1-input"
                          type="text"
                          value={company.addressLine1}
                          onChange={e => setCompany(p => ({ ...p, addressLine1: e.target.value }))}
                          placeholder="Address line 1"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="address-2-input" className="text-[10px] uppercase font-bold text-slate-400">Address Line 2</label>
                        <input
                          id="address-2-input"
                          type="text"
                          value={company.addressLine2}
                          onChange={e => setCompany(p => ({ ...p, addressLine2: e.target.value }))}
                          placeholder="City, State"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="comm-phone-input" className="text-[10px] uppercase font-bold text-slate-400">Corporate Phone</label>
                        <input
                          id="comm-phone-input"
                          type="text"
                          value={company.phone}
                          onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))}
                          placeholder="Phone number"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="comm-email-input" className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                        <input
                          id="comm-email-input"
                          type="email"
                          value={company.email}
                          onChange={e => setCompany(p => ({ ...p, email: e.target.value }))}
                          placeholder="contact@company.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="comm-web-input" className="text-[10px] uppercase font-bold text-slate-400">Website Address</label>
                      <input
                        id="comm-web-input"
                        type="text"
                        value={company.website}
                        onChange={e => setCompany(p => ({ ...p, website: e.target.value }))}
                        placeholder="www.company.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: LAYOUT STYLE SELECTION & COLORS */}
              {activeTab === 'layout' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                  key="layout-tab"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
                      <Palette size={16} className="text-indigo-400" />
                      <span>Stationery Layout Design</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Select corporate formatting layouts, color spectrum accents, and typography grids.
                    </p>
                  </div>

                  {/* Primary Layout Style Themes */}
                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block pb-1">Layout Template</label>
                    <div className="space-y-2">
                      {[
                        { id: 'classic-top', name: 'Classic Top Header', desc: 'Standard formal header block with vertical details grid' },
                        { id: 'modern-split', name: 'Modern Split Balance', desc: 'High-contrast logo details left/right split header' },
                        { id: 'side-ribbon', name: 'Left Accent Ribbon', desc: 'Creative, modern colored sidebar with offset document body' },
                        { id: 'minimalist-clean', name: 'Minimalist Centered', desc: 'Boutique-clean central geometry for designers & architects' },
                        { id: 'creative-block', name: 'Modern Creative Block', desc: 'Bold inverted block banner for modern enterprise firms' }
                      ].map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setStyle(p => ({ ...p, theme: theme.id as LayoutTheme }))}
                          className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                            style.theme === theme.id 
                              ? 'border-indigo-500 bg-indigo-500/10' 
                              : 'border-slate-800 hover:border-slate-700 bg-slate-900/55'
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            style.theme === theme.id ? 'border-indigo-400' : 'border-slate-600'
                          }`}>
                            {style.theme === theme.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{theme.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{theme.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette Accents */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block pb-1">Accent Colors</label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {ACCENT_COLORS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyColorPreset(preset.primary, preset.secondary)}
                          className={`p-2 rounded-lg border text-left flex items-center gap-2.5 transition ${
                            style.primaryColor === preset.primary 
                              ? 'border-indigo-500 bg-indigo-500/10' 
                              : 'border-slate-800 hover:border-slate-750 bg-slate-950/40'
                          }`}
                        >
                          <div className="flex gap-0.5">
                            <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: preset.primary }} />
                            <div className="w-4 h-4 rounded-full shadow-inner -ml-1 border border-slate-900" style={{ backgroundColor: preset.secondary }} />
                          </div>
                          <span className="text-xs font-medium text-slate-300 truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Picker Inputs */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label htmlFor="custom-pri-color" className="text-[10px] uppercase font-bold text-slate-400 block">Primary Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            id="custom-pri-color"
                            type="color"
                            value={style.primaryColor}
                            onChange={e => setStyle(p => ({ ...p, primaryColor: e.target.value }))}
                            className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono">{style.primaryColor.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="custom-sec-color" className="text-[10px] uppercase font-bold text-slate-400 block">Accent Accent</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            id="custom-sec-color"
                            type="color"
                            value={style.secondaryColor}
                            onChange={e => setStyle(p => ({ ...p, secondaryColor: e.target.value }))}
                            className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                          />
                          <span className="text-xs font-mono">{style.secondaryColor.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Font Scheme Pairs */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block pb-1">Typography Scheme</label>
                    <div className="space-y-2">
                      {[
                        { id: 'modern', name: 'Swiss Modern (Sans + Sans)', fonts: 'Space Grotesk + Inter', preview: 'A4 Layout Stationery' },
                        { id: 'executive', name: 'Executive Classic (Serif + Serif)', fonts: 'Playfair Display + Lora', preview: 'Official Correspondence' },
                        { id: 'creative', name: 'Aesthetic Creative (Sans + Serif)', fonts: 'Plus Jakarta Sans + Lora', preview: 'Brand Leadership Portfolio' },
                        { id: 'minimalist', name: 'System Minimalist (Inter Sans)', fonts: 'Inter + Inter Only', preview: 'Clean Boutique Design' }
                      ].map(font => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setStyle(p => ({ ...p, fontPair: font.id as any }))}
                          className={`w-full p-2.5 rounded-lg border text-left transition flex justify-between items-center ${
                            style.fontPair === font.id 
                              ? 'border-indigo-500 bg-indigo-500/10' 
                              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-200">{font.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{font.fonts}</p>
                          </div>
                          <span className="text-xs italic text-slate-400 pl-2 pr-1 font-semibold">{font.preview.substring(0, 8)}...</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accents, Paper & Watermark */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2">
                      Paper Accents
                    </h4>

                    {/* Paper background shade selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Paper stock tone</label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setStyle(p => ({ ...p, paperBackground: 'solid-white' }))}
                          className={`py-1 text-xs rounded transition font-medium ${
                            style.paperBackground === 'solid-white' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Solid White
                        </button>
                        <button
                          type="button"
                          onClick={() => setStyle(p => ({ ...p, paperBackground: 'warm-ivory' }))}
                          className={`py-1 text-xs rounded transition font-medium ${
                            style.paperBackground === 'warm-ivory' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Warm Ivory
                        </button>
                        <button
                          type="button"
                          onClick={() => setStyle(p => ({ ...p, paperBackground: 'cream-texture' }))}
                          className={`py-1 text-xs rounded transition font-medium ${
                            style.paperBackground === 'cream-texture' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Classic Cream
                        </button>
                      </div>
                    </div>

                    {/* Accent Bars configuration */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Accent geometric guard</label>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 border border-slate-900 rounded-lg text-[10px] font-medium">
                        {[
                          { id: 'top', label: 'Top' },
                          { id: 'left', label: 'Left' },
                          { id: 'bottom', label: 'Bottom' },
                          { id: 'none', label: 'None' }
                        ].map(barOpt => (
                          <button
                            key={barOpt.id}
                            type="button"
                            onClick={() => setStyle(p => ({ ...p, accentBarPosition: barOpt.id as any }))}
                            className={`py-1 text-center rounded transition uppercase ${
                              style.accentBarPosition === barOpt.id ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {barOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Watermark Setup */}
                    <div className="space-y-2 border-t border-slate-850 pt-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="watermark-toggle" className="text-[10px] uppercase font-bold text-slate-400 cursor-pointer">Confidential Watermark</label>
                        <input
                          id="watermark-toggle"
                          type="checkbox"
                          checked={style.showWatermark}
                          onChange={e => setStyle(p => ({ ...p, showWatermark: e.target.checked }))}
                          className="w-4 h-4 text-indigo-500 bg-slate-950 rounded border-slate-800 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      {style.showWatermark && (
                        <input
                          type="text"
                          value={style.watermarkText}
                          onChange={e => setStyle(p => ({ ...p, watermarkText: e.target.value }))}
                          placeholder="e.g. DUPLICATE"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CORRESPONDENCE & PROPOSAL EDITOR */}
              {activeTab === 'content' && docMode === 'letter' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                  key="content-letter-tab"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
                      <FileText size={16} className="text-indigo-400" />
                      <span>Letter Composition details</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Draft your business letters using our pre-formatted sections, or load professional sample letters.
                    </p>
                  </div>

                  {/* Letter Preset Quick Loader */}
                  <div className="bg-slate-900 border border-indigo-900/30 p-4 rounded-xl space-y-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                      <Bookmark size={12} />
                      <span>Preset Letter Templates</span>
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Instantly load formal boilerplate correspondence to test different paper layouts:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRESET_LETTER_TEMPLATES.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => loadPresetLetter(p.id)}
                          className="text-[10px] font-semibold bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 px-2.5 py-1.5 rounded-md text-slate-300 hover:text-indigo-300 transition cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Details Coordination block */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2">
                      Recipient Coordination
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="recip-name" className="text-[10px] uppercase font-bold text-slate-400">Full Name</label>
                        <input
                          id="recip-name"
                          type="text"
                          value={letter.recipientName}
                          onChange={e => setLetter(p => ({ ...p, recipientName: e.target.value }))}
                          placeholder="e.g. Dr. Eleanor Parker"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="recip-company" className="text-[10px] uppercase font-bold text-slate-400">Company Name</label>
                        <input
                          id="recip-company"
                          type="text"
                          value={letter.recipientCompany}
                          onChange={e => setLetter(p => ({ ...p, recipientCompany: e.target.value }))}
                          placeholder="e.g. Innovatech Global"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="recip-address" className="text-[10px] uppercase font-bold text-slate-400">Recipient Mailing Address</label>
                      <textarea
                        id="recip-address"
                        rows={2}
                        value={letter.recipientAddress}
                        onChange={e => setLetter(p => ({ ...p, recipientAddress: e.target.value }))}
                        placeholder="Mailing coordinates"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Letter Header Fields (Date, Reference, Subject, Salutation) */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2">
                      Reference & Heading
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="letter-date-input" className="text-[10px] uppercase font-bold text-slate-400">Document Date</label>
                        <input
                          id="letter-date-input"
                          type="text"
                          value={letter.date}
                          onChange={e => setLetter(p => ({ ...p, date: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="letter-ref-input" className="text-[10px] uppercase font-bold text-slate-400">Reference No.</label>
                        <input
                          id="letter-ref-input"
                          type="text"
                          value={letter.referenceNo}
                          onChange={e => setLetter(p => ({ ...p, referenceNo: e.target.value }))}
                          placeholder="e.g. CL-2026-X81"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="letter-subject-input" className="text-[10px] uppercase font-bold text-slate-400">Subject Line</label>
                      <input
                        id="letter-subject-input"
                        type="text"
                        value={letter.subject}
                        onChange={e => setLetter(p => ({ ...p, subject: e.target.value }))}
                        placeholder="Enter letter subject"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="letter-salut-input" className="text-[10px] uppercase font-bold text-slate-400">Salutation Greeting</label>
                      <input
                        id="letter-salut-input"
                        type="text"
                        value={letter.salutation}
                        onChange={e => setLetter(p => ({ ...p, salutation: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Letter Body Text */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label htmlFor="letter-body-input" className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block border-b border-slate-850 pb-2">
                      Correspondence Text Body
                    </label>
                    <textarea
                      id="letter-body-input"
                      rows={10}
                      value={letter.body}
                      onChange={e => setLetter(p => ({ ...p, body: e.target.value }))}
                      placeholder="Type your official correspondence here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-650 font-sans leading-relaxed focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CORRESPONDENCE & PROPOSAL EDITOR - PROPOSAL MODE */}
              {activeTab === 'content' && docMode === 'proposal' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                  key="content-proposal-tab"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-400" />
                      <span>Proposal & Scope Settings</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Formulate system requirements, project outlines, and a calculated pricing breakdown.
                    </p>
                  </div>

                  {/* Recipient Details Coordination block (Shared recipient state) */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2">
                      Prospect Client coordinates
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="recip-name-proposal" className="text-[10px] uppercase font-bold text-slate-400">Prospect Contact</label>
                        <input
                          id="recip-name-proposal"
                          type="text"
                          value={letter.recipientName}
                          onChange={e => setLetter(p => ({ ...p, recipientName: e.target.value }))}
                          placeholder="e.g. Dr. Eleanor Parker"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="recip-company-proposal" className="text-[10px] uppercase font-bold text-slate-400">Enterprise Client</label>
                        <input
                          id="recip-company-proposal"
                          type="text"
                          value={letter.recipientCompany}
                          onChange={e => setLetter(p => ({ ...p, recipientCompany: e.target.value }))}
                          placeholder="e.g. Innovatech Global"
                          className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="recip-address-proposal" className="text-[10px] uppercase font-bold text-slate-400">Mailing coordinates</label>
                      <textarea
                        id="recip-address-proposal"
                        rows={2}
                        value={letter.recipientAddress}
                        onChange={e => setLetter(p => ({ ...p, recipientAddress: e.target.value }))}
                        placeholder="Mailing coordinates"
                        className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Document date & Reference */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="space-y-1">
                      <label htmlFor="letter-date-input-prop" className="text-[10px] uppercase font-bold text-slate-400">Document Date</label>
                      <input
                        id="letter-date-input-prop"
                        type="text"
                        value={letter.date}
                        onChange={e => setLetter(p => ({ ...p, date: e.target.value }))}
                        className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="letter-ref-input-prop" className="text-[10px] uppercase font-bold text-slate-400">Reference / RFP No.</label>
                      <input
                        id="letter-ref-input-prop"
                        type="text"
                        value={letter.referenceNo}
                        onChange={e => setLetter(p => ({ ...p, referenceNo: e.target.value }))}
                        placeholder="e.g. RFP-2026-X81"
                        className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Proposal General Scope & Objectives block */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="space-y-1">
                      <label htmlFor="proposal-title-input" className="text-[11px] uppercase tracking-wider font-bold text-slate-350 block">Project Title</label>
                      <input
                        id="proposal-title-input"
                        type="text"
                        value={proposal.projectTitle}
                        onChange={e => setProposal(p => ({ ...p, projectTitle: e.target.value }))}
                        placeholder="Project Title"
                        className="w-full bg-slate-955 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-100 placeholder-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="proposal-objectives-input" className="text-[11px] uppercase tracking-wider font-bold text-slate-350 block">1. Scope Summary & Objectives</label>
                      <textarea
                        id="proposal-objectives-input"
                        rows={3}
                        value={proposal.objectives}
                        onChange={e => setProposal(p => ({ ...p, objectives: e.target.value }))}
                        placeholder="Describe the project objective, parameters, or background context..."
                        className="w-full bg-slate-955 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-sans leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Newline-separated requirements list */}
                  <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label htmlFor="proposal-requirements-input" className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block">
                      2. Scope Deliverables & Technical Specs
                    </label>
                    <p className="text-[10px] text-slate-500 leading-normal mb-1">
                      * Enter one specific requirement/deliverable milestone per line. They will render beautifully with styled accent-colored bullets.
                    </p>
                    <textarea
                      id="proposal-requirements-input"
                      rows={4}
                      value={proposal.requirements}
                      onChange={e => setProposal(p => ({ ...p, requirements: e.target.value }))}
                      placeholder="e.g. Requirement Deliverable 1&#10;Requirement Deliverable 2"
                      className="w-full bg-slate-955 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* 3. Interactive Budget Table builder */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300">
                        3. Budget Allocation Builder
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newItem: BudgetLineItem = {
                            id: `item-${Date.now()}`,
                            description: 'New technical milestone provision',
                            quantity: 1,
                            unitPrice: 500.00
                          };
                          setProposal(prev => ({
                            ...prev,
                            budgetItems: [...prev.budgetItems, newItem]
                          }));
                        }}
                        className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Service Line</span>
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {proposal.budgetItems.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No budget allocations specified. Click Add above.</p>
                      ) : (
                        proposal.budgetItems.map((item, idx) => (
                          <div key={item.id} className="bg-slate-955 p-3 rounded-lg border border-slate-850 relative group">
                            <div className="flex flex-col gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-slate-500">Service / Deliverable name</label>
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={e => {
                                    const updated = [...proposal.budgetItems];
                                    updated[idx].description = e.target.value;
                                    setProposal(p => ({ ...p, budgetItems: updated }));
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 placeholder-slate-700 focus:outline-none"
                                  placeholder="e.g. Cloud Server Migration"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-slate-500">Quantity / Hours</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={e => {
                                      const updated = [...proposal.budgetItems];
                                      updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                      setProposal(p => ({ ...p, budgetItems: updated }));
                                    }}
                                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 text-center focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-slate-500">Unit Price ({proposal.currencySymbol})</label>
                                  <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={item.unitPrice}
                                    onChange={e => {
                                      const updated = [...proposal.budgetItems];
                                      updated[idx].unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
                                      setProposal(p => ({ ...p, budgetItems: updated }));
                                    }}
                                    className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 text-right focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setProposal(prev => ({
                                  ...prev,
                                  budgetItems: prev.budgetItems.filter(bi => bi.id !== item.id)
                                }));
                              }}
                              className="absolute top-2 right-2 text-slate-600 hover:text-red-400 p-1 rounded transition cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Monetary settings */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-850">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block">Currency</label>
                        <select
                          value={proposal.currencySymbol}
                          onChange={e => setProposal(p => ({ ...p, currencySymbol: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="$">United States Dollar ($)</option>
                          <option value="€">Euro (€)</option>
                          <option value="£">British Pound (£)</option>
                          <option value="¥">Yen / Yuan (¥)</option>
                          <option value="฿">Thai Baht (฿)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block">VAT / Tax Rate (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={proposal.taxRate}
                          onChange={e => setProposal(p => ({ ...p, taxRate: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 text-center focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special terms notes details */}
                  <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label htmlFor="proposal-notes-input" className="text-[11px] uppercase tracking-wider font-bold text-slate-350 block">4. Dynamic Proposal Terms / Extra Notes</label>
                    <textarea
                      id="proposal-notes-input"
                      rows={2.5}
                      value={proposal.notes}
                      onChange={e => setProposal(p => ({ ...p, notes: e.target.value }))}
                      placeholder="e.g. Pricing is valid for 60 business days from receipt."
                      className="w-full bg-slate-955 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SIGNOFF & DIGITAL SIGNATURES */}
              {activeTab === 'signature' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                  key="signature-tab"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
                      <Signature size={16} className="text-indigo-400" />
                      <span>Correspondence closing details</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Set up corporate signoffs, signatures, designated roles, and cursive handwriting effects.
                    </p>
                  </div>

                  {/* Sender Metadata */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2">
                      Signatory details
                    </h4>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label htmlFor="letter-closing-input" className="text-[10px] uppercase font-bold text-slate-400">Closing Term</label>
                        <input
                          id="letter-closing-input"
                          type="text"
                          value={letter.closing}
                          onChange={e => setLetter(p => ({ ...p, closing: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="sender-name-input" className="text-[10px] uppercase font-bold text-slate-400">Signee Name</label>
                          <input
                            id="sender-name-input"
                            type="text"
                            value={letter.senderName}
                            onChange={e => setLetter(p => ({ ...p, senderName: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="sender-title-input" className="text-[10px] uppercase font-bold text-slate-400">Title Designation</label>
                          <input
                            id="sender-title-input"
                            type="text"
                            value={letter.senderTitle}
                            onChange={e => setLetter(p => ({ ...p, senderTitle: e.target.value }))}
                            placeholder="e.g. Managing Director"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signature Type Config Grid */}
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block pb-1">Signature Layout Style</label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-900 mb-3">
                      <button
                        type="button"
                        onClick={() => setLetter(p => ({ ...p, signatureType: 'type' }))}
                        className={`py-1.5 text-xs rounded font-medium transition ${
                          letter.signatureType === 'type' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Calligraphy
                      </button>
                      <button
                        type="button"
                        onClick={() => setLetter(p => ({ ...p, signatureType: 'draw' }))}
                        className={`py-1.5 text-xs rounded font-medium transition ${
                          letter.signatureType === 'draw' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Pen Canvas
                      </button>
                      <button
                        type="button"
                        onClick={() => setLetter(p => ({ ...p, signatureType: 'none' }))}
                        className={`py-1.5 text-xs rounded font-medium transition ${
                          letter.signatureType === 'none' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        None
                      </button>
                    </div>

                    {/* CALLIGRAPHY TYPED FONTS INPUT */}
                    {letter.signatureType === 'type' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label htmlFor="sig-text-input" className="text-[10px] uppercase font-bold text-slate-400">Type Signature initials / word</label>
                          <input
                            id="sig-text-input"
                            type="text"
                            value={letter.signatureText}
                            onChange={e => setLetter(p => ({ ...p, signatureText: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-light leading-normal">
                          * Generates premium script writing from loaded Google calligraphy typography models.
                        </p>
                      </div>
                    )}

                    {/* PEN DRAWING PAD CANVAS */}
                    {letter.signatureType === 'draw' && (
                      <SignaturePad 
                        onSave={handleSaveSignature}
                        onClear={handleClearSignature}
                        defaultValue={letter.signatureDrawing}
                        color={style.primaryColor}
                      />
                    )}

                    {letter.signatureType === 'none' && (
                      <p className="text-xs text-slate-500 leading-normal text-center py-2 bg-slate-950/20 rounded">
                        No digital signature placeholder will be formatted below.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 5: CLOUD PERSISTENCE & USER SYNC */}
              {activeTab === 'cloud' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6 animate-none"
                  key="cloud-tab"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 flex items-center gap-2">
                      <Cloud size={16} className="text-indigo-400" />
                      <span>Cloud Database Sync</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Connect your account to securely store, retrieve, and organize all your custom stationery layouts on the cloud.
                    </p>
                  </div>

                  {!currentUser ? (
                    // Login view
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-center space-y-4">
                      <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                        <Database size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-200">Sign in with Google</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                          Access your custom letterheads, designs, and budgets from any device instantly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <LogIn size={15} />
                        <span>Connect Google Account</span>
                      </button>
                    </div>
                  ) : (
                    // Logged in view
                    <div className="space-y-6">
                      {/* User Profile Info */}
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {currentUser.photoURL ? (
                            <img
                              src={currentUser.photoURL}
                              alt={currentUser.displayName || 'User'}
                              className="w-9 h-9 rounded-full border border-indigo-500/30"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-indigo-600/30 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-200 block truncate leading-none">
                              {currentUser.displayName || 'User'}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                              {currentUser.email}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-900/80 transition cursor-pointer"
                          title="Sign Out"
                        >
                          <LogOut size={15} />
                        </button>
                      </div>

                      {/* Save Current Document Section */}
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 border-b border-slate-850 pb-2 flex justify-between items-center">
                          <span>Save current design</span>
                          {activeFirebaseDocId && (
                            <span className="bg-emerald-600/20 text-emerald-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/35">
                              CLOUD SAVED
                            </span>
                          )}
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label htmlFor="save-doc-title-input" className="text-[10px] uppercase font-bold text-slate-400">
                              Document Title / Project Name
                            </label>
                            <input
                              id="save-doc-title-input"
                              type="text"
                              value={documentSaveTitle}
                              onChange={e => setDocumentSaveTitle(e.target.value)}
                              placeholder={activeFirebaseDocId ? "Update existing template title..." : "e.g. Acme Q3 Proposal"}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveDocument()}
                            disabled={isSaving}
                            className={`w-full text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                              isSaving 
                                ? 'bg-slate-800 border border-slate-750 text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10 hover:shadow-indigo-600/20'
                            }`}
                          >
                            <Save size={15} className={isSaving ? 'animate-spin' : ''} />
                            <span>
                              {isSaving 
                                ? 'Saving to Cloud...' 
                                : activeFirebaseDocId 
                                  ? 'Update Current Cloud Design' 
                                  : 'Save as New Cloud Design'}
                            </span>
                          </button>
                          
                          {activeFirebaseDocId && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveFirebaseDocId(null);
                                setDocumentSaveTitle('');
                              }}
                              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 font-bold text-xs py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Unlink from active Cloud document (Copy as new)
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Saved Templates Collection List */}
                      <div className="space-y-3">
                        <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                          Your Saved Designs ({savedDocs.length})
                        </h4>

                        {isLoadingDocs ? (
                          <p className="text-xs text-slate-500 text-center py-6 animate-pulse">
                            Loading your secure cloud vault...
                          </p>
                        ) : savedDocs.length === 0 ? (
                          <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl text-center">
                            <span className="text-xs text-slate-500 block">No documents found.</span>
                            <span className="text-[10px] text-slate-600 block mt-1">
                              Your saved templates and letters will appear here.
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                            {savedDocs.map((savedDoc) => {
                              const isActive = activeFirebaseDocId === savedDoc.id;
                              return (
                                <div
                                  key={savedDoc.id}
                                  onClick={() => handleLoadDocument(savedDoc)}
                                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                                    isActive
                                      ? 'bg-indigo-600/10 border-indigo-500/40 hover:bg-indigo-600/15'
                                      : 'bg-slate-950/80 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-200 block truncate">
                                        {savedDoc.title}
                                      </span>
                                      <span className={`text-[8px] font-mono px-1 rounded uppercase tracking-wider shrink-0 ${
                                        savedDoc.docMode === 'proposal'
                                          ? 'bg-purple-900/45 text-purple-300 border border-purple-500/30'
                                          : 'bg-blue-900/45 text-blue-300 border border-blue-500/30'
                                      }`}>
                                        {savedDoc.docMode}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                                      Updated {savedDoc.updatedAt?.toDate 
                                        ? savedDoc.updatedAt.toDate().toLocaleDateString() 
                                        : new Date().toLocaleDateString()}
                                    </span>
                                  </div>
                                  
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteDocument(savedDoc.id, e)}
                                    className="text-slate-600 hover:text-red-400 p-1.5 rounded hover:bg-slate-900 transition ml-2 shrink-0 cursor-pointer"
                                    title="Delete from Cloud"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-slate-900 p-4 bg-slate-950 text-center text-[10px] text-slate-600 no-print">
            Professional Letterhead Builder &bull; Ver 1.4
          </div>
        </aside>

        {/* B. RIGHT CANVAS PREVIEW (Workspace grid area) */}
        <section 
          className="flex-1 bg-[#0f172a] shadow-inner overflow-auto p-4 flex justify-center items-start lg:py-12 py-6 relative"
          style={{
            backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundColor: '#0b0f19'
          }}
          id="letterhead-preview-container"
        >
          {/* Active styling helper tooltip */}
          <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-slate-400 pointer-events-none select-none shadow-md no-print">
            <Sliders size={12} className="text-indigo-400 animate-pulse" />
            <span>Active Paper Aspect Ratio: <strong>A4 Portrait (210 &times; 297mm)</strong></span>
          </div>

          {/* Floated printer action pill for easy view compatibility */}
          <div className="absolute top-4 right-4 flex gap-2 no-print">
            <button
              onClick={triggerPrintLetter}
              className="bg-indigo-600 text-white font-bold text-xs p-2.5 rounded-full flex items-center justify-center hover:bg-indigo-500 hover:scale-105 transition active:scale-95 shadow-lg shadow-indigo-600/30 cursor-pointer"
              title="Print Document"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={() => {
                // Quick reset back to default zoom
                if (window.innerWidth < 768) {
                  setPreviewScale(0.38);
                } else if (window.innerWidth < 1440) {
                  setPreviewScale(0.68);
                } else {
                  setPreviewScale(0.78);
                }
              }}
              className="bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs p-2.5 rounded-full flex items-center justify-center hover:bg-slate-900 transition active:scale-95"
              title="Fit to Screen zoom"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Actual Letterhead Card Component */}
          <div className="transition-all duration-300" style={{ perspective: '1000px' }}>
            <LetterheadCanvas
              company={company}
              letter={letter}
              style={style}
              scale={previewScale}
              docMode={docMode}
              proposal={proposal}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
