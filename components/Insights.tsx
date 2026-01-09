
import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, CheckCircle2, RefreshCw } from 'lucide-react';
import { Expense, Insight, Language } from '../types';
import { getSmartInsights } from '../services/geminiService';
import { translations } from '../translations';

interface InsightsProps {
  expenses: Expense[];
  lang: Language;
}

const Insights: React.FC<InsightsProps> = ({ expenses, lang }) => {
  const t = translations[lang];
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    const activeExpenses = expenses.filter(e => e.isActive !== false);
    if (activeExpenses.length < 3) return;
    setLoading(true);
    const data = await getSmartInsights(activeExpenses, lang);
    setInsight(data);
    setLoading(false);
  };

  useEffect(() => {
    const activeExpenses = expenses.filter(e => e.isActive !== false);
    if (activeExpenses.length >= 3 && !insight) {
      fetchInsights();
    }
  }, [expenses]);

  const activeExpensesCount = expenses.filter(e => e.isActive !== false).length;

  if (activeExpensesCount < 3) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center">
        <Sparkles className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="text-slate-500 text-sm">{t.iaMinData}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-sm border border-indigo-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
          <BrainCircuit className="text-indigo-600" />
          {t.iaInsights}
        </h2>
        <button onClick={fetchInsights} disabled={loading} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition-all">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-indigo-100 rounded w-3/4"></div>
          <div className="h-20 bg-indigo-50 rounded w-full"></div>
        </div>
      ) : insight ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{t.iaTip}</span>
            <p className="text-indigo-900 font-medium mt-1">"{insight.tip}"</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-800 mb-2">{t.iaHabits}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{insight.analysis}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-800 mb-3">{t.iaRecs}</h3>
            <div className="space-y-2">
              {insight.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <CheckCircle2 className="text-indigo-500 w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-slate-700 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500">{t.iaError}</p>
        </div>
      )}
    </div>
  );
};

export default Insights;
