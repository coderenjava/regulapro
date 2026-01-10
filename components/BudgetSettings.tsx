
import React, { useState, useMemo } from 'react';
import { Target, Save, Download, Upload, Database, CalendarClock } from 'lucide-react';
import { CategoryBudget, Category, Language } from '../types';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import { translations } from '../translations';
import { storageService } from '../services/storage';

interface BudgetSettingsProps {
  budgets: CategoryBudget;
  onSave: (budgets: CategoryBudget) => void;
  onImportSuccess: () => void;
  lang: Language;
}

const BudgetSettings: React.FC<BudgetSettingsProps> = ({ 
  budgets, 
  onSave, 
  onImportSuccess, 
  lang
}) => {
  const t = translations[lang];
  const [localBudgets, setLocalBudgets] = useState<CategoryBudget>(budgets);
  const [isSaved, setIsSaved] = useState(false);
  const [lastBackupRaw, setLastBackupRaw] = useState<string | null>(storageService.getLastBackupDate());

  // Formater dynamiquement la date de sauvegarde selon la langue choisie
  const formattedLastBackup = useMemo(() => {
    if (!lastBackupRaw) return null;
    try {
      const date = new Date(lastBackupRaw);
      // Vérifier si c'est une date valide (format ISO)
      if (isNaN(date.getTime())) return lastBackupRaw; // Fallback pour les anciennes sauvegardes déjà formatées
      
      return date.toLocaleString(lang, { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (e) {
      return lastBackupRaw;
    }
  }, [lastBackupRaw, lang]);

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

    // On stocke maintenant le format ISO pour permettre un re-formatage dynamique
    const nowISO = new Date().toISOString();
    storageService.saveLastBackupDate(nowISO);
    setLastBackupRaw(nowISO);
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

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Database className="text-indigo-600" size={24} />
            {t.dataManagement}
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
              <CalendarClock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.lastBackup}</p>
              <p className="font-black text-slate-700">
                {formattedLastBackup || t.noBackup}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95 group"
            >
              <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
              {t.exportData}
            </button>
            
            <label className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm cursor-pointer active:scale-95 group">
              <Upload size={20} className="group-hover:-translate-y-0.5 transition-transform" />
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
