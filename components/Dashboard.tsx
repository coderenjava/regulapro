
import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Expense, Category, CategoryBudget, Language } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from '../constants';
import { translations } from '../translations';
import { TrendingUp, Wallet, ReceiptText, BarChart3, ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  budgets: CategoryBudget;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, budgets, lang }) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const stats = useMemo(() => {
    // Ne prendre en compte que les dépenses actives
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

  const totalMonthly = Object.values(stats.monthlyByCategory).reduce((a: number, b: number) => a + b, 0) as number;

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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
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
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 md:p-6 rounded-2xl shadow-lg shadow-blue-100 text-white">
          <div className="flex items-center gap-3 opacity-80 mb-2">
            <Wallet size={18} />
            <span className="font-medium text-sm md:text-base">{t.totalSpent}</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold">
            {new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(totalMonthly as number)}
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <ReceiptText size={18} />
            <span className="font-medium text-sm md:text-base">{t.transactions}</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-800">
             {new Intl.NumberFormat(lang).format(stats.count as number)}
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <CheckCircle2 size={18} className="text-green-500" />
            <span className="font-medium text-sm md:text-base">{t.budgetsRespected}</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-800">
            {new Intl.NumberFormat(lang).format(CATEGORIES.length - stats.budgetAlerts.filter(a => a.percent >= 100).length)} / {new Intl.NumberFormat(lang).format(CATEGORIES.length)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-6">{t.goalTracking}</h3>
          <div className="space-y-5">
            {CATEGORIES.map(cat => {
              const spent = stats.monthlyByCategory[cat] || 0;
              const budget = budgets[cat] || 0;
              const percent = budget > 0 ? (spent / budget) * 100 : 0;
              
              let barColor = 'bg-blue-500';
              if (percent >= 100) barColor = 'bg-red-500';
              else if (percent >= 80) barColor = 'bg-amber-500';
              else barColor = 'bg-blue-500';

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-bold">{t.categories[cat]}</span>
                      {percent >= 100 && <AlertTriangle size={14} className="text-red-500 animate-bounce" />}
                    </div>
                    <div className="text-slate-500">
                      <span className="font-bold text-slate-900">{new Intl.NumberFormat(lang).format(Math.round(spent))}€</span>
                      <span className="mx-1">/</span>
                      <span>{new Intl.NumberFormat(lang).format(budget)}€</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base md:text-lg font-bold text-slate-800">{t.topExpenses}</h3>
          </div>
          <div className="space-y-5 flex-grow">
            {stats.topFiveMonth.map((expense) => (
              <div key={expense.id} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg text-white shrink-0" style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}>
                      {CATEGORY_ICONS[expense.category]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{expense.title}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{t.categories[expense.category]}</p>
                    </div>
                  </div>
                  <div className="text-end ms-2">
                    <p className="text-sm font-black text-slate-900">
                      {new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(expense.amount)}
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
