import React, { useState } from 'react';
import { Sparkles, FileText, Briefcase, ScrollText, Receipt, BookOpen, User, Building2, FileCheck, Users, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getAIService } from '../../services/ai-service';
import { useStore } from '../../store';

const PROMPT_TEMPLATES = [
  {
    category: 'Letters',
    icon: ScrollText,
    prompts: [
      { id: 'offer-letter', label: 'Offer Letter', prompt: 'Write a professional job offer letter for a senior software engineer position.' },
      { id: 'appointment', label: 'Appointment Letter', prompt: 'Write a formal appointment letter for a new department head.' },
      { id: 'experience', label: 'Experience Certificate', prompt: 'Write an experience certificate for a departing employee.' },
      { id: 'hr-letter', label: 'HR Letter', prompt: 'Write a professional HR letter regarding policy update.' },
      { id: 'meeting-minutes', label: 'Meeting Minutes', prompt: 'Write formal meeting minutes for a board of directors meeting.' },
    ],
  },
  {
    category: 'Business',
    icon: Briefcase,
    prompts: [
      { id: 'proposal', label: 'Business Proposal', prompt: 'Write a professional business proposal for IT consulting services.' },
      { id: 'company-profile', label: 'Company Profile', prompt: 'Write a compelling company profile for a technology startup.' },
      { id: 'exec-summary', label: 'Executive Summary', prompt: 'Write an executive summary for a digital transformation project.' },
      { id: 'business-overview', label: 'Business Overview', prompt: 'Write a comprehensive business overview document.' },
    ],
  },
  {
    category: 'Finance',
    icon: Receipt,
    prompts: [
      { id: 'invoice-notes', label: 'Invoice Notes', prompt: 'Write professional payment terms and notes for an invoice.' },
      { id: 'quotation', label: 'Quotation', prompt: 'Write a formal quotation for web development services.' },
      { id: 'report-summary', label: 'Report Summary', prompt: 'Write an executive summary for a quarterly financial report.' },
    ],
  },
  {
    category: 'HR & Admin',
    icon: Users,
    prompts: [
      { id: 'appraisal', label: 'Appraisal Letter', prompt: 'Write a performance appraisal letter for an outstanding employee.' },
      { id: 'termination', label: 'Termination Letter', prompt: 'Write a professional termination letter.' },
      { id: 'reference', label: 'Reference Letter', prompt: 'Write a letter of recommendation for a valued employee.' },
      { id: 'warning', label: 'Show Cause Notice', prompt: 'Write a formal show cause notice for policy violation.' },
    ],
  },
];

export function AIAssistant() {
  const [activeCategory, setActiveCategory] = useState<string>('Letters');
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const addNotification = useStore((s) => s.addNotification);

  const category = PROMPT_TEMPLATES.find((c) => c.category === activeCategory);
  const Icon = category?.icon || Sparkles;

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    setError('');
    try {
      const ai = getAIService();
      const res = await ai.generate(prompt, 'You are a professional business document writer. Generate clear, formal, well-structured content.');
      if (res.success) {
        setResult(res.content);
        addNotification({ type: 'success', message: 'AI content generated successfully' });
      } else {
        setError(res.error || 'Generation failed');
        addNotification({ type: 'error', message: res.error || 'AI generation failed' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      addNotification({ type: 'error', message: 'AI generation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGenerate = () => {
    if (!customPrompt.trim()) return;
    handleGenerate(customPrompt);
  };

  const handleApplyToDocument = () => {
    const store = useStore.getState();
    if (store.docMode === 'letter') {
      store.updateLetter({ body: result });
    }
    addNotification({ type: 'success', message: 'Content applied to document' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400">AI Assistant</h3>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {PROMPT_TEMPLATES.map((cat) => {
          const CatIcon = cat.icon;
          const isActive = activeCategory === cat.category;
          return (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CatIcon size={12} />
              <span>{cat.category}</span>
            </button>
          );
        })}
      </div>

      {/* Prompt templates */}
      {category && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Quick Templates</p>
          <div className="grid grid-cols-1 gap-1">
            {category.prompts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleGenerate(p.prompt)}
                disabled={loading}
                className="text-left px-3 py-2 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-indigo-500/30 text-xs text-slate-300 hover:text-indigo-300 transition disabled:opacity-50 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom prompt */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Custom Prompt</p>
        <textarea
          rows={3}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Describe what you want to write..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
        <Button
          onClick={handleCustomGenerate}
          disabled={!customPrompt.trim() || loading}
          loading={loading}
          className="w-full"
        >
          <Sparkles size={14} />
          <span>{loading ? 'Generating...' : 'Generate'}</span>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-500">Generated Content</p>
            <Button size="sm" variant="primary" onClick={handleApplyToDocument}>
              <FileText size={12} /> Apply to Document
            </Button>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{result}</p>
          </div>
        </div>
      )}
    </div>
  );
}
