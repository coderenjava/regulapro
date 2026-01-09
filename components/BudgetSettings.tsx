
import React, { useState, useEffect } from 'react';
import { Target, Save, Download, Upload, ShieldCheck, ShieldAlert, Database, BrainCircuit, ExternalLink, Sparkles } from 'lucide-react';
import { CategoryBudget, Category, Language } from '../types';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { translations } from '../translations';
import { storageService } from '../services/storage';

interface BudgetSettingsProps {
  budgets: CategoryBudget;
  onSave: (budgets: CategoryBudget) => void;
  onImportSuccess: () => void;
  lang: Language;
  isPersisted: boolean;
}

const BudgetSettings: React.FC<BudgetSettingsProps> = ({ budgets, onSave, onImportSuccess, lang, isPersisted }) => {
  const t = translations[lang];
  const [localBudgets, setLocalBudgets] = useState<CategoryBudget>(budgets);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      // On assume le succès selon les règles de la plateforme
      setHasApiKey(true);
    }
  };

  const handleChange = (category: Category, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalBudgets(prev => ({ ...prev, [category]: numValue }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave(localBudgets);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExport = () => {
    const data = storageService.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regula-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importAllData(content);
      if (success) {
        onImportSuccess();
      } else {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* AI Configuration Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-0.5 shadow-xl shadow-indigo-100 overflow-hidden">
        <div className="bg-white rounded-[1.4rem] overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={24} />
              {t.aiConfig}
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${hasApiKey ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-200 text-slate-400'}`}>
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{t.apiKeyStatus}</p>
                  <p className={`text-lg font-black ${hasApiKey ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {hasApiKey ? t.apiKeyConnected : t.apiKeyNotConnected}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleOpenKeySelector}
                className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <BrainCircuit size={20} />
                {t.connectApiKey}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <p className="text-sm text-slate-400 font-medium flex-1">
                {t.apiKeyInfo}
              </p>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-700 transition-colors shrink-0"
              >
                {t.billingDoc}
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Target className="text-blue-600" size={24} />
            {t.goalTracking}
          </h2>
          <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100'}`}>
            <Save size={18} />
            {isSaved ? '✓' : t.save}
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map(category => (
            <div key={category} className="group p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl text-white shadow-md" style={{ backgroundColor: CATEGORY_COLORS[category] }}>
                    {CATEGORY_ICONS[category]}
                  </div>
                  <span className="font-black text-slate-700">{t.categories[category]}</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={localBudgets[category]}
                  onChange={(e) => handleChange(category, e.target.value)}
                  className="w-full ps-10 pe-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-900 font-black text-lg"
                />
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">€</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Database className="text-indigo-600" size={24} />
            {t.dataManagement}
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isPersisted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {isPersisted ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.storageStatus}</p>
                <p className={`font-black ${isPersisted ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isPersisted ? t.storagePersisted : t.storageNormal}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
            >
              <Download size={20} />
              {t.exportData}
            </button>
            
            <label className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm cursor-pointer active:scale-95">
              <Upload size={20} />
              {t.importData}
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSettings;
