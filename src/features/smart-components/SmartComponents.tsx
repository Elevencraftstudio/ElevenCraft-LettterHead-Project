import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard, PenTool, Type, Table, MapPin, Mail, Phone, Globe, MessageSquare, FileSignature, Users, Building2, Calendar
} from 'lucide-react';
import { useStore } from '../../store';
import { CanvasElement } from '../../types/document';

interface SmartComponent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'content' | 'contact' | 'branding' | 'data' | 'legal';
  createElements: (index: number) => CanvasElement[];
}

const SMART_COMPONENTS: SmartComponent[] = [
  {
    id: 'business-card',
    name: 'Business Card Block',
    description: 'Name, title, company with contact icons',
    icon: CreditCard,
    category: 'contact',
    createElements: (i) => [
      { id: `bc-name-${i}`, type: 'text', x: 20, y: 20, width: 260, height: 24, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: 'John Doe', fontSize: 16, fontWeight: 700 } },
      { id: `bc-title-${i}`, type: 'text', x: 20, y: 48, width: 260, height: 18, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 1, props: { text: 'Chief Executive Officer', fontSize: 11, fontWeight: 500 } },
      { id: `bc-email-${i}`, type: 'contact', x: 20, y: 76, width: 260, height: 16, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 2, props: { text: 'john@company.com' } },
      { id: `bc-phone-${i}`, type: 'contact', x: 20, y: 96, width: 260, height: 16, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 3, props: { text: '+1 (555) 123-4567' } },
    ],
  },
  {
    id: 'address-block',
    name: 'Address Block',
    description: 'Company address with map icon',
    icon: MapPin,
    category: 'contact',
    createElements: (i) => [
      { id: `addr-${i}`, type: 'address', x: 20, y: 20, width: 240, height: 60, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: '123 Business Avenue\nSuite 400\nNew York, NY 10001\nUnited States' } },
    ],
  },
  {
    id: 'contact-bar',
    name: 'Contact Bar',
    description: 'Phone, email, website in a row',
    icon: MessageSquare,
    category: 'contact',
    createElements: (i) => [
      { id: `cb-phone-${i}`, type: 'contact', x: 20, y: 20, width: 140, height: 18, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: '📞 +1 (555) 123-4567' } },
      { id: `cb-email-${i}`, type: 'contact', x: 170, y: 20, width: 180, height: 18, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 1, props: { text: '✉ contact@company.com' } },
      { id: `cb-web-${i}`, type: 'contact', x: 360, y: 20, width: 140, height: 18, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 2, props: { text: '🌐 www.company.com' } },
    ],
  },
  {
    id: 'social-icons',
    name: 'Social Icons Strip',
    description: 'LinkedIn, Twitter, Facebook, Instagram',
    icon: Users,
    category: 'branding',
    createElements: (i) => [
      { id: `social-${i}`, type: 'text', x: 20, y: 20, width: 300, height: 24, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: 'in  𝗳  𝗫  📷  ▶  Follow us @company', fontSize: 13 } },
    ],
  },
  {
    id: 'signature-block',
    name: 'Signature Block',
    description: 'Name, title, date with signature line',
    icon: PenTool,
    category: 'content',
    createElements: (i) => [
      { id: `sig-name-${i}`, type: 'text', x: 20, y: 20, width: 280, height: 28, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: 'Arthur Vance', fontSize: 18, fontWeight: 700 } },
      { id: `sig-title-${i}`, type: 'text', x: 20, y: 50, width: 280, height: 16, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 1, props: { text: 'Chief Integration Officer', fontSize: 11 } },
      { id: `sig-date-${i}`, type: 'text', x: 20, y: 76, width: 280, height: 16, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 2, props: { text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), fontSize: 10 } },
    ],
  },
  {
    id: 'invoice-table',
    name: 'Invoice Table',
    description: 'Itemized invoice with quantities and totals',
    icon: Table,
    category: 'data',
    createElements: (i) => [
      { id: `inv-table-${i}`, type: 'text', x: 20, y: 20, width: 520, height: 200, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: 'Invoice #INV-2026-001\n\nDescription                  Qty    Rate     Amount\nCloud Services               2     $2,450   $4,900\nConsulting                   40    $150     $6,000\nLicense Fees                 1     $1,200   $1,200\n\nSubtotal: $12,100\nTax (8%):     $968\nTotal:       $13,068', fontSize: 10, fontFamily: 'mono' } },
    ],
  },
  {
    id: 'header-bar',
    name: 'Header Bar',
    description: 'Company logo placeholder + name + tagline',
    icon: Type,
    category: 'branding',
    createElements: (i) => [
      { id: `hdr-logo-${i}`, type: 'logo', x: 20, y: 20, width: 48, height: 48, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: {} },
      { id: `hdr-name-${i}`, type: 'text', x: 80, y: 22, width: 300, height: 24, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 1, props: { text: 'COMPANY NAME', fontSize: 20, fontWeight: 800, letterSpacing: 2 } },
      { id: `hdr-tag-${i}`, type: 'text', x: 80, y: 48, width: 300, height: 16, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i + 2, props: { text: 'Tagline or mission statement', fontSize: 10, letterSpacing: 1 } },
    ],
  },
  {
    id: 'footer-bar',
    name: 'Footer Bar',
    description: 'Copyright, company info, page number',
    icon: FileSignature,
    category: 'legal',
    createElements: (i) => [
      { id: `ftr-text-${i}`, type: 'text', x: 20, y: 12, width: 560, height: 20, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: `© ${new Date().getFullYear()} Company Name. All rights reserved. | contact@company.com | Page 1`, fontSize: 8, color: '#94a3b8' } },
    ],
  },
  {
    id: 'confidential-notice',
    name: 'Confidential Notice',
    description: 'Legal disclaimer for confidential documents',
    icon: FileSignature,
    category: 'legal',
    createElements: (i) => [
      { id: `conf-${i}`, type: 'text', x: 20, y: 20, width: 560, height: 50, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: 'CONFIDENTIAL\nThis document contains proprietary information. Unauthorized distribution is prohibited.', fontSize: 8, color: '#dc2626', fontWeight: 600 } },
    ],
  },
  {
    id: 'date-block',
    name: 'Date & Reference',
    description: 'Date and reference number block',
    icon: Calendar,
    category: 'content',
    createElements: (i) => [
      { id: `dt-ref-${i}`, type: 'text', x: 20, y: 20, width: 240, height: 36, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: i, props: { text: `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\nRef: DOC-2026-001`, fontSize: 10 } },
    ],
  },
];

const CATEGORIES = [
  { id: 'contact', label: 'Contact & Address', icon: MapPin },
  { id: 'branding', label: 'Branding', icon: Building2 },
  { id: 'content', label: 'Content', icon: Type },
  { id: 'data', label: 'Data & Tables', icon: Table },
  { id: 'legal', label: 'Legal & Footer', icon: FileSignature },
] as const;

export function SmartComponents() {
  const [activeCat, setActiveCat] = useState<string>('contact');
  const addNotification = useStore((s) => s.addNotification);
  const { pages, activePageId, addElement } = useStore();

  const filtered = SMART_COMPONENTS.filter((c) => c.category === activeCat);

  const handleInsert = (component: SmartComponent) => {
    const pageId = activePageId || pages[0]?.id;
    if (!pageId) {
      addNotification({ type: 'warning', message: 'No active page to insert into' });
      return;
    }
    const count = pages.find((p) => p.id === pageId)?.elements.length || 0;
    const elements = component.createElements(count);
    elements.forEach((el) => addElement(pageId, el));
    addNotification({ type: 'success', message: `Inserted "${component.name}"` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard size={14} className="text-indigo-400" />
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">Components</h3>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const isActive = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CatIcon size={11} />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Component grid */}
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map((comp) => {
          const Icon = comp.icon;
          return (
            <motion.button
              key={comp.id}
              layout
              onClick={() => handleInsert(comp)}
              className="text-left w-full bg-slate-900/40 border border-slate-800 rounded-xl p-3 hover:border-indigo-500/40 transition cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-indigo-400 group-hover:bg-indigo-600/20 transition">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition">{comp.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{comp.description}</p>
                  <p className="text-[9px] text-slate-700 mt-1">
                    {comp.createElements(0).length} element{comp.createElements(0).length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-6 text-center text-xs text-slate-600">No components in this category</div>
      )}
    </div>
  );
}
