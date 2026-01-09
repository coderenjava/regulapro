
import React, { useState } from 'react';
import { Target, Save, Download, Upload, ShieldCheck, ShieldAlert, Database } from 'lucide-react';
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
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Budget Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-blue-600" size={24} />
            {t.goalTracking}
          </h2>
          <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100'}`}>
            <Save size={18} />
            {isSaved ? '✓' : t.save}
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map(category => (
            <div key={category} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: CATEGORY_COLORS[category] }}>
                    {CATEGORY_ICONS[category]}
                  </div>
                  <span className="font-bold text-slate-700">{t.categories[category]}</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={localBudgets[category]}
                  onChange={(e) => handleChange(category, e.target.value)}
                  className="w-full ps-8 pe-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-indigo-600" size={24} />
            {t.dataManagement}
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Storage Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPersisted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {isPersisted ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.storageStatus}</p>
                <p className={`font-bold ${isPersisted ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isPersisted ? t.storagePersisted : t.storageNormal}
                </p>
              </div>
            </div>
          </div>

          {/* Backup Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
            >
              <Download size={20} />
              {t.exportData}
            </button>
            
            <label className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm cursor-pointer">
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
