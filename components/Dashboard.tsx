
import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Expense, Category, CategoryBudget, Language } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from '../constants';
import { translations } from '../translations';
import { TrendingUp, Wallet, ReceiptText, BarChart3, ArrowUpRight, AlertTriangle, CheckCircle2, LayoutGrid } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  budgets: CategoryBudget;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, budgets, lang }) => {
  const t = translations[lang];

  const stats = useMemo(() => {
    const activeExpenses = expenses.filter(e => e.isActive !== false);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = activeExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthlyByCategory = currentMonthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<Category, number>);

    const pieData = Object.entries(monthlyByCategory).map(([name, value]) => ({
      name: t.categories[name as Category] || name,
      value
    }));

    const topFiveMonth = [...currentMonthExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const budgetAlerts = CATEGORIES.map(cat => {
      const spent = monthlyByCategory[cat] || 0;
      const budget = budgets[cat] || 0;
      const percent = budget > 0 ? (spent / budget) * 100 : 0;
      return { category: cat, spent, budget, percent };
    }).filter(a => a.percent >= 80);

    return { pieData, count: activeExpenses.length, topFiveMonth, monthlyByCategory, budgetAlerts };
  }, [expenses, budgets, t]);

  const totalMonthly = (Object.values(stats.monthlyByCategory) as number[]).reduce((a, b) => a + b, 0);
  const totalBudget = (Object.values(budgets) as number[]).reduce((a, b) => a + b, 0);
  const globalPercent = totalBudget > 0 ? (totalMonthly / totalBudget) * 100 : 0;

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="bg-slate-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-slate-800">{t.noData}</h3>
        <p className="text-slate-500 mt-2 text-sm md:text-base">{t.addExpensePrompt}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats.budgetAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-grow text-center md:text-start">
            <h4 className="font-bold text-amber-900">{t.iaTip}</h4>
            <p className="text-amber-700 text-sm">
              {t.budgetAlert.replace('{count}', stats.budgetAlerts.length.toString())}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 md:p-7 rounded-3xl shadow-xl shadow-blue-900/10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 opacity-80 mb-3">
              <Wallet size={18} />
              <span className="font-black text-xs uppercase tracking-widest">{t.totalSpent}</span>
            </div>
            <div className="text-3xl md:text-4xl font-black mb-4">
              {new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(totalMonthly)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase opacity-80">
                <span>Budget Global</span>
                <span>{Math.round(globalPercent)}%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-white transition-all duration-1000 ${globalPercent > 100 ? 'bg-red-300' : ''}`}
                  style={{ width: `${Math.min(globalPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-slate-500">
              <ReceiptText size={18} />
              <span className="font-black text-xs uppercase tracking-widest">{t.transactions}</span>
            </div>
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-800">
             {new Intl.NumberFormat(lang).format(Number(stats.count))}
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-2">Dépenses enregistrées</p>
        </div>

        <div className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-200 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-slate-500">
              <CheckCircle2 size={18} className="text-green-500" />
              <span className="font-black text-xs uppercase tracking-widest">{t.budgetsRespected}</span>
            </div>
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-800">
            {new Intl.NumberFormat(lang).format(CATEGORIES.length - stats.budgetAlerts.filter(a => a.percent >= 100).length)}
            <span className="text-slate-300 mx-2 text-2xl">/</span>
            <span className="text-slate-400 text-2xl">{CATEGORIES.length}</span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-2">Catégories sous contrôle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <LayoutGrid size={20} className="text-blue-600" />
              {t.goalTracking}
            </h3>
          </div>
          <div className="space-y-6">
            {CATEGORIES.map(cat => {
              const spent = stats.monthlyByCategory[cat] || 0;
              const budget = budgets[cat] || 0;
              const percent = budget > 0 ? (spent / budget) * 100 : 0;
              
              let barColor = 'bg-blue-600';
              if (percent >= 100) barColor = 'bg-red-500';
              else if (percent >= 80) barColor = 'bg-amber-500';

              return (
                <div key={cat} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg text-white`} style={{ backgroundColor: CATEGORY_COLORS[cat] }}>
                        {React.cloneElement(CATEGORY_ICONS[cat] as React.ReactElement, { size: 14 })}
                      </div>
                      <span className="text-sm font-black text-slate-700">{t.categories[cat]}</span>
                      {percent >= 100 && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                    </div>
                    <div className="text-end">
                      <span className="text-sm font-black text-slate-900">{new Intl.NumberFormat(lang).format(Math.round(spent))}€</span>
                      <span className="text-slate-400 text-[10px] mx-1 uppercase font-black">sur</span>
                      <span className="text-xs font-bold text-slate-400">{new Intl.NumberFormat(lang).format(budget)}€</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${barColor}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp size={20} className="text-indigo-600" />
              {t.topExpenses}
            </h3>
          </div>
          <div className="space-y-4 flex-grow">
            {stats.topFiveMonth.map((expense) => (
              <div key={expense.id} className="group p-4 bg-slate-50/50 hover:bg-white hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-slate-100 rounded-2xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl text-white shrink-0 shadow-lg" style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}>
                      {CATEGORY_ICONS[expense.category]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-black text-slate-800 truncate">{expense.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t.categories[expense.category]}</p>
                    </div>
                  </div>
                  <div className="text-end ms-4">
                    <p className="text-lg font-black text-slate-900">
                      {new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(expense.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {new Date(expense.date).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
