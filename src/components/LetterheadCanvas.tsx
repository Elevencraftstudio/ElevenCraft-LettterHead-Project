/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CompanyDetails, LetterContent, StyleConfig, ProposalContent, DocumentMode } from '../types';
import { LogoPreset } from './LogoPresets';
import { MapPin, Phone, Mail, Globe, Calendar, FileText } from 'lucide-react';

interface LetterheadCanvasProps {
  company: CompanyDetails;
  letter: LetterContent;
  style: StyleConfig;
  scale?: number; // Scaling factor for preview, e.g. 0.8
  docMode?: DocumentMode;
  proposal?: ProposalContent;
}

export const LetterheadCanvas: React.FC<LetterheadCanvasProps> = ({
  company,
  letter,
  style,
  scale = 1,
  docMode = 'letter' as DocumentMode,
  proposal
}) => {
  // Get font pair classes
  const getFontClasses = () => {
    switch (style.fontPair) {
      case 'executive':
        return {
          header: 'font-[Playfair_Display] serif-elegant',
          body: 'font-[Lora] serif-classic',
          meta: 'font-[Inter] sans-serif'
        };
      case 'modern':
        return {
          header: 'font-[Space_Grotesk] display-modern tracking-tight font-bold',
          body: 'font-[Inter] sans-serif',
          meta: 'font-[Space_Grotesk] display-modern'
        };
      case 'creative':
        return {
          header: 'font-[Plus_Jakarta_Sans] tracking-wide font-extrabold',
          body: 'font-[Lora] serif-classic italic-serif',
          meta: 'font-[Plus_Jakarta_Sans]'
        };
      case 'minimalist':
      default:
        return {
          header: 'font-[Inter] tracking-normal font-semibold',
          body: 'font-[Inter] sans-serif',
          meta: 'font-[Inter]'
        };
    }
  };

  const fonts = getFontClasses();

  // Paper background colors
  const getPaperBgClass = () => {
    switch (style.paperBackground) {
      case 'cream-texture':
        return 'bg-[#FCF8F2]';
      case 'warm-ivory':
        return 'bg-[#FAF9F5]';
      case 'solid-white':
      default:
        return 'bg-white';
    }
  };

  // Render Logo depending on type
  const renderLogo = (logoSizeClass: string = "w-10 h-10") => {
    if (company.logoType === 'upload' && company.logoUrl) {
      return (
        <img
          src={company.logoUrl}
          alt={`${company.name} Logo`}
          className={`${logoSizeClass} object-contain rounded`}
          referrerPolicy="no-referrer"
          id="company-logo-img"
        />
      );
    } else if (company.logoType === 'initials') {
      const initials = company.logoInitials || company.name.substring(0, 2).toUpperCase();
      return (
        <div
          className={`${logoSizeClass} flex items-center justify-center rounded font-bold border-2 text-sm shadow-sm select-none`}
          style={{
            borderColor: style.primaryColor,
            color: style.primaryColor,
            backgroundColor: `${style.primaryColor}10`
          }}
          id="company-logo-initials"
        >
          {initials}
        </div>
      );
    } else if (company.logoType === 'preset' && company.logoPreset) {
      return (
        <LogoPreset
          name={company.logoPreset}
          primaryColor={style.primaryColor}
          secondaryColor={style.secondaryColor}
          className={logoSizeClass}
          id="company-logo-preset"
        />
      );
    }
    return (
      <div 
        className={`${logoSizeClass} flex items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-gray-400`}
        id="company-logo-empty"
      >
        Logo
      </div>
    );
  };

  // Standard inline formatting for style-based elements
  const primaryText = { color: style.primaryColor };
  const borderPrimary = { borderColor: style.primaryColor };
  const bgPrimary = { backgroundColor: style.primaryColor };

  return (
    <div
      id="letterhead-print-canvas"
      className={`shadow-2xl relative select-text text-gray-800 transition-all origin-top duration-300 ${getPaperBgClass()} mx-auto border border-gray-200/50 print:border-none print:shadow-none`}
      style={{
        width: '210mm',
        height: '297mm',
        minWidth: '210mm',
        minHeight: '297mm',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        marginBottom: scale !== 1 ? `calc((297mm * ${scale - 1}))` : undefined,
      }}
    >
      {/* Decorative accent top-bar if configured */}
      {style.accentBarPosition === 'top' && (
        <div className="h-2 w-full absolute top-0 left-0" style={bgPrimary} />
      )}

      {/* Decorative accent left-bar if configured */}
      {style.accentBarPosition === 'left' && (
        <div className="w-2 h-full absolute top-0 left-0" style={bgPrimary} />
      )}

      {/* Watermark in center of paper */}
      {style.showWatermark && style.watermarkText && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          id="letterhead-watermark"
        >
          <span 
            className="text-[11vw] font-bold uppercase rotate-12 opacity-[0.04] tracking-widest leading-none text-center select-none"
            style={{ color: style.primaryColor }}
          >
            {style.watermarkText}
          </span>
        </div>
      )}

      {/* RENDER THEMES */}

      {/* ------- THEME 1: CLASSIC TOP (Corporate Executive) ------- */}
      {style.theme === 'classic-top' && (
        <div className="h-full flex flex-col justify-between py-12 px-14 relative z-10" id="theme-classic">
          <div>
            {/* Header Area */}
            <div className="flex justify-between items-start border-b pb-8" style={{ borderColor: `${style.primaryColor}20` }}>
              <div className="flex items-center gap-4">
                {renderLogo("w-14 h-14")}
                <div>
                  <h1 className={`text-2xl font-bold uppercase tracking-wider text-gray-900 ${fonts.header}`} style={primaryText}>
                    {company.name || "Company Name"}
                  </h1>
                  <p className={`text-xs text-gray-500 font-medium ${fonts.meta}`}>
                    {company.tagline || "Your Elegant Slogan or Mission"}
                  </p>
                </div>
              </div>
              
              {/* Contact Block Grid style */}
              <div className={`text-right text-[10px] leading-relaxed text-gray-600 ${fonts.meta} space-y-0.5`}>
                {company.addressLine1 && <p className="font-medium text-gray-800">{company.addressLine1}</p>}
                {company.addressLine2 && <p>{company.addressLine2}</p>}
                <div className="pt-1.5 space-y-0.5 opacity-90">
                  {company.phone && <p>Tel: {company.phone}</p>}
                  {company.email && <p>E: {company.email}</p>}
                  {company.website && <p className="font-semibold" style={primaryText}>{company.website}</p>}
                </div>
              </div>
            </div>

            {/* Letter Head Body Section */}
            {renderDocumentContent(docMode, letter, proposal, fonts, style)}
          </div>

          {/* Elegant Footer Line */}
          <div className="border-t pt-6" style={{ borderColor: `${style.primaryColor}15` }}>
            <div className={`flex justify-between items-center text-[9px] text-gray-400 ${fonts.meta}`}>
              <p>© {new Date().getFullYear()} {company.name || "Company Name"}. All rights reserved.</p>
              <div className="flex gap-4">
                {company.email && <span>{company.email}</span>}
                {company.website && <span className="font-semibold" style={primaryText}>{company.website}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------- THEME 2: MODERN SPLIT (High Contrast Modern Balance) ------- */}
      {style.theme === 'modern-split' && (
        <div className="h-full flex flex-col justify-between py-12 px-14 relative z-10" id="theme-modern">
          <div>
            {/* Header Area */}
            <div className="flex justify-between items-end pb-10">
              <div className="flex items-center gap-4">
                {renderLogo("w-16 h-16")}
                <div>
                  <h1 className={`text-2xl leading-none text-gray-900 uppercase tracking-widest ${fonts.header}`}>
                    {company.name || "Company Name"}
                  </h1>
                  <div className="h-1 w-20 mt-2" style={bgPrimary} />
                  <p className={`text-[10px] text-gray-400 tracking-wider mt-1.5 uppercase ${fonts.meta}`}>
                    {company.tagline || "Your Elegant Slogan or Mission"}
                  </p>
                </div>
              </div>
              
              <div className={`flex flex-col items-end gap-1.5 text-xs text-gray-600 ${fonts.meta}`}>
                {company.addressLine1 && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>{company.addressLine1} {company.addressLine2}</span>
                    <MapPin size={10} style={primaryText} />
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>{company.phone}</span>
                    <Phone size={10} style={primaryText} />
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>{company.email}</span>
                    <Mail size={10} style={primaryText} />
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={primaryText}>
                    <span>{company.website}</span>
                    <Globe size={10} />
                  </div>
                )}
              </div>
            </div>

            {/* Custom line break divider */}
            <div className="h-[1px] w-full bg-gray-100 mb-8" />

            {/* Letter content */}
            {renderDocumentContent(docMode, letter, proposal, fonts, style)}
          </div>

          <div className="text-center">
            <p className={`text-[9px] text-gray-400 tracking-[0.2em] uppercase ${fonts.meta}`}>
              {company.name} &bull; Confidential Correspondence
            </p>
          </div>
        </div>
      )}

      {/* ------- THEME 3: SIDE RIBBON (Creative Sidebar Ribbon Layout) ------- */}
      {style.theme === 'side-ribbon' && (
        <div className="h-full flex relative z-10" id="theme-sideribbon">
          {/* Left Ribbon Sidebar Panel */}
          <div 
            className="w-[70mm] h-full flex flex-col justify-between py-12 px-8 text-white relative"
            style={{
              backgroundColor: style.primaryColor,
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.1) 100%)'
            }}
          >
            {/* Top Logo */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-white p-2 rounded shadow-md">
                {renderLogo("w-14 h-14")}
              </div>
              <div>
                <h1 className={`text-md font-bold uppercase tracking-widest ${fonts.header}`}>
                  {company.name || "Company"}
                </h1>
                <p className={`text-[9px] opacity-75 mt-1 leading-snug font-light ${fonts.meta}`}>
                  {company.tagline || "Slogan Brand"}
                </p>
              </div>
            </div>

            {/* Vertically Aligned Compact Metadata Panel */}
            <div className={`space-y-5 text-left text-[10px] opacity-90 tracking-wide font-light ${fonts.meta}`}>
              <div className="h-[1px] bg-white/20 w-12" />
              
              {company.addressLine1 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-white/70">
                    <MapPin size={10} />
                    <span className="font-semibold text-[9px] uppercase tracking-wider">Office</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{company.addressLine1}{company.addressLine2 ? `,\n${company.addressLine2}` : ''}</p>
                </div>
              )}

              {company.phone && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-white/70">
                    <Phone size={10} />
                    <span className="font-semibold text-[9px] uppercase tracking-wider">Phone</span>
                  </div>
                  <p>{company.phone}</p>
                </div>
              )}

              {company.email && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-white/70">
                    <Mail size={10} />
                    <span className="font-semibold text-[9px] uppercase tracking-wider">Email</span>
                  </div>
                  <p className="break-all">{company.email}</p>
                </div>
              )}

              {company.website && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-white/70">
                    <Globe size={10} />
                    <span className="font-semibold text-[9px] uppercase tracking-wider">Website</span>
                  </div>
                  <p className="font-medium underline decoration-white/30">{company.website}</p>
                </div>
              )}
            </div>

            {/* Footer stamp inside ribbon */}
            <p className={`text-[8px] text-white/40 tracking-wider text-center ${fonts.meta}`}>
              EST. {new Date().getFullYear() - 5}
            </p>
          </div>

          {/* Right Letter Content Area */}
          <div className="flex-1 py-12 px-12 flex flex-col justify-between">
            {renderDocumentContent(docMode, letter, proposal, fonts, style, true)}
            
            <div className={`text-right text-[9px] text-gray-400 ${fonts.meta}`}>
              Document ref: {letter.referenceNo || "LHD-2026-001"}
            </div>
          </div>
        </div>
      )}

      {/* ------- THEME 4: MINIMALIST CLEAN (Boutique Centered Aesthetic) ------- */}
      {style.theme === 'minimalist-clean' && (
        <div className="h-full flex flex-col justify-between py-12 px-14 relative z-10" id="theme-minimalist">
          <div>
            {/* Header Centered block */}
            <div className="text-center space-y-3 pb-8">
              <div className="flex justify-center">
                {renderLogo("w-12 h-12")}
              </div>
              <div className="space-y-0.5">
                <h1 className={`text-2xl font-bold tracking-widest text-gray-900 uppercase ${fonts.header}`}>
                  {company.name || "Company Name"}
                </h1>
                <p className={`text-[10px] text-gray-400 tracking-[0.3em] font-light uppercase ${fonts.meta}`}>
                  {company.tagline || "Your Elegant Slogan or Mission"}
                </p>
              </div>

              {/* Minimal dot separator */}
              <div className="flex justify-center items-center gap-1.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full" style={bgPrimary} />
                <div className="w-12 h-[1px] bg-gray-200" />
                <div className="w-1.5 h-1.5 rounded-full" style={bgPrimary} />
              </div>
              
              {/* Minimal coordinates */}
              <div className={`flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[9px] tracking-wider text-gray-500 uppercase ${fonts.meta}`}>
                {company.addressLine1 && <span>{company.addressLine1} {company.addressLine2}</span>}
                {company.phone && <span>&bull;&nbsp; {company.phone}</span>}
                {company.email && <span>&bull;&nbsp; {company.email}</span>}
                {company.website && <span className="font-semibold" style={primaryText}>&bull;&nbsp; {company.website}</span>}
              </div>
            </div>

            {/* Letter body */}
            {renderDocumentContent(docMode, letter, proposal, fonts, style)}
          </div>

          <div className="text-center pt-4 border-t border-gray-100">
            <span className={`text-[8px] tracking-[0.4em] uppercase text-gray-300 font-light ${fonts.meta}`}>
              {company.name || "Company Name"}
            </span>
          </div>
        </div>
      )}

      {/* ------- THEME 5: CREATIVE BLOCK (Bold Modern Header Strip) ------- */}
      {style.theme === 'creative-block' && (
        <div className="h-full flex flex-col justify-between relative z-10" id="theme-creativeblock">
          <div>
            {/* Solid accent background bar */}
            <div 
              className="py-10 px-14 text-white flex justify-between items-center"
              style={{
                backgroundColor: style.primaryColor,
                backgroundImage: 'linear-gradient(225deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.15) 100%)'
              }}
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-lg shadow-sm">
                  {renderLogo("w-10 h-10")}
                </div>
                <div>
                  <h1 className={`text-xl font-extrabold uppercase tracking-wide leading-none ${fonts.header}`}>
                    {company.name || "Company Name"}
                  </h1>
                  <p className={`text-[9px] tracking-wider opacity-80 mt-1 uppercase ${fonts.meta}`}>
                    {company.tagline || "Slogan Or Tagline Here"}
                  </p>
                </div>
              </div>

              {/* Minimal Top-Right Coordinates */}
              <div className={`text-right text-[9px] opacity-90 space-y-0.5 max-w-[50%] ${fonts.meta}`}>
                <p className="font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                  {company.addressLine1} {company.addressLine2}
                </p>
                <div className="flex gap-2 justify-end opacity-75">
                  {company.phone && <span>{company.phone}</span>}
                  {company.website && <span className="font-bold underline">{company.website}</span>}
                </div>
              </div>
            </div>

            {/* Letter inner content with padding */}
            <div className="px-14 py-8">
              {renderDocumentContent(docMode, letter, proposal, fonts, style, false, true)}
            </div>
          </div>

          {/* Elegant geometric block footer */}
          <div className="px-14 py-8 flex justify-between items-center bg-gray-50/50 border-t border-gray-100">
            <div className={`text-[9px] text-gray-400 ${fonts.meta}`}>
              {company.email && <span>E: {company.email}</span>}
              {company.website && <span className="ml-4">W: {company.website}</span>}
            </div>
            <div 
              className="h-1.5 w-24 rounded-full" 
              style={{backgroundColor: style.secondaryColor || style.primaryColor}} 
            />
          </div>
        </div>
      )}

      {/* Decorative accent bottom-bar if configured */}
      {style.accentBarPosition === 'bottom' && (
        <div className="h-2 w-full absolute bottom-0 left-0" style={bgPrimary} />
      )}
    </div>
  );
};

// Sub-helper: Render closing signoff block
const renderClosingBlock = (
  letter: LetterContent,
  fonts: { header: string; body: string; meta: string },
  style: StyleConfig
) => {
  return (
    <div className={`pt-4 break-inside-avoid space-y-3 ${fonts.body}`}>
      <div className="space-y-1">
        <p className="text-xs text-gray-500">{letter.closing || "Sincerely,"}</p>
      </div>

      {/* Dynamic Signature Output */}
      {letter.signatureType !== 'none' && (
        <div className="h-12 flex items-center" id="letterhead-signature-area">
          {letter.signatureType === 'draw' && letter.signatureDrawing && (
            <img 
              src={letter.signatureDrawing} 
              alt="Signature" 
              className="h-12 object-contain opacity-95 pointer-events-none" 
              referrerPolicy="no-referrer"
            />
          )}
          {letter.signatureType === 'type' && letter.signatureText && (
            <div 
              className="text-2xl font-[Alex_Brush] font-medium tracking-wider text-sky-800/90 py-1"
              style={{ fontFamily: '"Alex Brush", "Dancing Script", "Caveat", cursive' }}
            >
              {letter.signatureText}
            </div>
          )}
        </div>
      )}

      {/* Sender Designation */}
      <div className={`space-y-0.5 ${fonts.meta}`}>
        <p className="font-semibold text-gray-900 text-xs">{letter.senderName || "Sender Name"}</p>
        {letter.senderTitle && <p className="text-[10px] text-gray-500 uppercase tracking-wider">{letter.senderTitle}</p>}
      </div>
    </div>
  );
};

// Sub-helper: Render Document content in position
const renderDocumentContent = (
  docMode: 'letter' | 'proposal',
  letter: LetterContent,
  proposal: ProposalContent | undefined,
  fonts: { header: string; body: string; meta: string },
  style: StyleConfig,
  isSidebarribbon: boolean = false,
  isCreativeblock: boolean = false
) => {
  const dynamicSpacingClass = isSidebarribbon ? 'mt-6' : isCreativeblock ? 'mt-4' : 'mt-10';
  const accentText = { color: style.primaryColor };
  const accentBg = { backgroundColor: style.primaryColor };

  const renderHeaderMeta = () => (
    <div className={`flex justify-between items-start text-xs ${fonts.meta} text-gray-600`}>
      {/* Recipient info block */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-sans">Recipient</p>
        <div className="text-gray-900 font-semibold space-y-0.5">
          {letter.recipientName && <p className="text-[13px]">{letter.recipientName}</p>}
          {letter.recipientCompany && <p className="text-gray-600 font-medium">{letter.recipientCompany}</p>}
        </div>
        {letter.recipientAddress && (
          <p className="text-gray-500 text-[11px] leading-relaxed whitespace-pre-wrap max-w-[220px]">
            {letter.recipientAddress}
          </p>
        )}
      </div>

      {/* Date / Document metadata block */}
      <div className="text-right space-y-1.5 text-[11px]">
        <div className="flex items-center justify-end gap-1 text-gray-500">
          <Calendar size={11} />
          <span>{letter.date || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        {letter.referenceNo && (
          <div className="flex items-center justify-end gap-1 text-gray-400 text-[10px]">
            <FileText size={10} />
            <span>Ref: {letter.referenceNo}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (docMode === 'proposal' && proposal) {
    const subtotal = proposal.budgetItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (proposal.taxRate / 100);
    const grandTotal = subtotal + taxAmount;
    const currency = proposal.currencySymbol || "$";
    const reqsList = proposal.requirements ? proposal.requirements.split('\n').filter(r => r.trim() !== '') : [];

    return (
      <div className={`${dynamicSpacingClass} space-y-4 flex-1`} id="letterhead-document-root">
        {renderHeaderMeta()}
        <hr className="border-gray-100" />

        {/* Project Heading */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded text-white" style={accentBg}>
              Scope Proposal
            </span>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Requirement Definition</span>
          </div>
          <h2 className={`text-base font-extrabold text-gray-950 leading-tight uppercase ${fonts.header}`}>
            {proposal.projectTitle || "Project Requirement & Budget Quote"}
          </h2>
        </div>

        {/* Overview Objectives */}
        {proposal.objectives && (
          <div className="space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <h3 className={`text-[9px] uppercase font-bold tracking-widest text-gray-400 ${fonts.meta}`}>
              1. Project Scope & Background
            </h3>
            <p className="text-[12px] text-gray-750 leading-relaxed font-sans">{proposal.objectives}</p>
          </div>
        )}

        {/* Bullet Specs */}
        {reqsList.length > 0 && (
          <div className="space-y-1.5">
            <h3 className={`text-[9px] uppercase font-bold tracking-widest text-gray-400 ${fonts.meta}`}>
              2. Technical & Business Requirements
            </h3>
            <div className="space-y-1 pl-1">
              {reqsList.map((req, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={accentBg} />
                  <span className="text-gray-700 leading-relaxed">{req}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Table */}
        <div className="space-y-1.5 pt-1">
          <h3 className={`text-[9px] uppercase font-bold tracking-widest text-gray-400 ${fonts.meta}`}>
            3. Budget Quote & Service Pricing
          </h3>
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="py-1.5 px-2.5">Scope Description</th>
                  <th className="py-1.5 px-1.5 text-center w-12">Qty</th>
                  <th className="py-1.5 px-2 text-right w-20">Rate</th>
                  <th className="py-1.5 px-2.5 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {proposal.budgetItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 px-2 text-center text-gray-400 italic">No budget allocations entered</td>
                  </tr>
                ) : (
                  proposal.budgetItems.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50/20">
                      <td className="py-1.5 px-2.5 font-medium text-gray-950">{item.description || "Service Provision"}</td>
                      <td className="py-1.5 px-1.5 text-center text-gray-500 font-mono">{item.quantity}</td>
                      <td className="py-1.5 px-2 text-right text-gray-500 font-mono">
                        {currency}{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-semibold text-gray-950 font-mono">
                        {currency}{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t border-gray-200 bg-gray-50/50">
                <tr>
                  <td colSpan={2} className="py-1 px-3 text-right text-gray-500 text-[10px]">Subtotal</td>
                  <td colSpan={2} className="py-1 px-2.5 text-right font-mono text-gray-800">
                    {currency}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {proposal.taxRate > 0 && (
                  <tr>
                    <td colSpan={2} className="py-0.5 px-3 text-right text-gray-500 text-[10px]">Est. Taxes ({proposal.taxRate}%)</td>
                    <td colSpan={2} className="py-0.5 px-2.5 text-right font-mono text-gray-600">
                      {currency}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-gray-200 bg-gray-50/80 font-bold">
                  <td colSpan={2} className="py-1.5 px-3 text-right text-gray-800 uppercase text-[10px] tracking-wider">Estimated Total</td>
                  <td colSpan={2} className="py-1.5 px-2.5 text-right font-mono text-xs font-extrabold" style={accentText}>
                    {currency}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Extra specifications notes */}
        {proposal.notes && (
          <div className="pt-0.5 leading-tight">
            <span className={`text-[8.5px] text-gray-400 uppercase font-bold tracking-wider ${fonts.meta}`}>Proposal Terms & Conditions:</span>
            <p className="text-[10px] text-gray-500 italic font-sans leading-normal">{proposal.notes}</p>
          </div>
        )}

        {renderClosingBlock(letter, fonts, style)}
      </div>
    );
  }

  return (
    <div className={`${dynamicSpacingClass} space-y-6 flex-1`} id="letterhead-document-root">
      {renderHeaderMeta()}

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Letter Subject */}
      {letter.subject && (
        <div className={`space-y-1 ${fonts.meta}`}>
          <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400">Subject:</span>
          <h2 className="text-sm font-bold text-gray-900 leading-snug tracking-wide" style={{ color: style.textColor }}>
            {letter.subject.toUpperCase()}
          </h2>
        </div>
      )}

      {/* Letter Salutation */}
      <div className={`text-xs text-gray-800 ${fonts.body}`}>
        <p className="font-semibold text-[13px]">{letter.salutation || "Dear Recipient,"}</p>
      </div>

      {/* Main Letter Body */}
      <div 
        className={`text-gray-700 leading-relaxed text-[13px] whitespace-pre-wrap text-justify ${fonts.body} pr-2`}
        style={{ minHeight: '130mm' }}
        id="letter-body-print-area"
      >
        {letter.body || "Please type your official company letter correspondence here. The layout updates in real-time."}
      </div>

      {/* Signoff / Closing coordinates */}
      {renderClosingBlock(letter, fonts, style)}
    </div>
  );
};;
