
import React, { useState, useMemo, useEffect } from 'react';
import { Edit3, Search, Filter, Calendar, CreditCard, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, X, Eye, EyeOff } from 'lucide-react';
import { Expense, Language, Category } from '../types';
import { CATEGORY_ICONS, CATEGORY_COLORS, CATEGORIES } from '../constants';
import { translations } from '../translations';

interface ExpenseListProps {
  expenses: Expense[];
  onUpdate: (expense: Expense) => void;
  onToggleActivity: (id: string) => void;
  lang: Language;
}

const ITEMS_PER_PAGE = 15;

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onUpdate, onToggleActivity, lang }) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Edit State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = e.title.toLowerCase().includes(searchStr) ||
                          t.categories[e.category].toLowerCase().includes(searchStr);
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter, t.categories]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE));
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExpenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredExpenses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleEditClick = (e: React.MouseEvent, expense: Expense) => {
    e.stopPropagation();
    setEditingExpense({ ...expense });
  };

  const handleToggleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleActivity(id);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      onUpdate(editingExpense);
      setEditingExpense(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
      {/* Edit Modal Overlay */}
      {editingExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Edit3 className="text-blue-600" size={20} />
                {t.editExpense}
              </h3>
              <button onClick={() => setEditingExpense(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.title}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 font-bold"
                  value={editingExpense.title}
                  onChange={(e) => setEditingExpense({...editingExpense, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.amount}</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full ps-10 pe-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 font-bold"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0})}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.category}</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 font-bold appearance-none"
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value as Category})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{t.categories[cat]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.date}</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 font-bold"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                />
              </div>

              {/* Action Buttons: perfectly responsive, equal size and width */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="w-full sm:flex-1 h-14 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.97] flex items-center justify-center order-2 sm:order-1"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 h-14 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.97] flex items-center justify-center order-1 sm:order-2"
                >
                  {t.update}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Filters */}
      <div className="p-5 md:p-8 border-b border-slate-100 bg-slate-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{t.history}</h2>
              <p className="text-slate-400 text-sm font-medium">{filteredExpenses.length} {t.transactions.toLowerCase()}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto">
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t.search}
                className="w-full ps-11 pe-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-black font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="w-full ps-11 pe-10 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all text-black font-medium text-sm cursor-pointer"
              >
                <option value="all">{t.filterAll}</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{t.categories[cat]}</option>
                ))}
              </select>
              <ChevronRightIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-start text-xs font-bold text-slate-400 uppercase tracking-widest">{t.title}</th>
              <th className="px-8 py-5 text-start text-xs font-bold text-slate-400 uppercase tracking-widest">{t.category}</th>
              <th className="px-8 py-5 text-start text-xs font-bold text-slate-400 uppercase tracking-widest">{t.date}</th>
              <th className="px-8 py-5 text-end text-xs font-bold text-slate-400 uppercase tracking-widest">{t.amount}</th>
              <th className="px-8 py-5 text-end text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentItems.map((expense) => {
              const isDisabled = expense.isActive === false;
              return (
                <tr key={expense.id} className={`group hover:bg-blue-50/30 transition-colors ${isDisabled ? 'opacity-40 grayscale' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className={`font-bold text-slate-800 text-base ${isDisabled ? 'line-through' : ''}`}>{expense.title}</span>
                      {isDisabled && <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{t.excluded}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl text-white shadow-sm" style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}>
                        {CATEGORY_ICONS[expense.category]}
                      </div>
                      <span className="text-sm font-bold text-slate-600">{t.categories[expense.category]}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <Calendar size={14} />
                      <span className="text-sm">{new Date(expense.date).toLocaleDateString(lang, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-end">
                    <span className="font-black text-slate-900 text-lg">
                      {new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(expense.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        type="button"
                        onClick={(e) => handleToggleClick(e, expense.id)} 
                        className={`p-3 rounded-2xl transition-all active:scale-95 ${isDisabled ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'}`}
                        title={isDisabled ? t.activate : t.deactivate}
                      >
                        {isDisabled ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleEditClick(e, expense)} 
                        className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-95"
                        title={t.editExpense}
                      >
                        <Edit3 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {currentItems.map((expense) => {
          const isDisabled = expense.isActive === false;
          return (
            <div key={expense.id} className={`p-5 flex items-center justify-between gap-4 active:bg-slate-50 transition-colors ${isDisabled ? 'opacity-40' : ''}`}>
              <div className="flex items-center gap-4 flex-grow min-w-0">
                <div className="p-3 rounded-2xl text-white shadow-md shrink-0" style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}>
                  {CATEGORY_ICONS[expense.category]}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-black text-slate-900 text-base truncate leading-tight ${isDisabled ? 'line-through' : ''}`}>{expense.title}</span>
                  <div className="flex items-center gap-2 text-slate-400 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t.categories[expense.category]}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(expense.date).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  {isDisabled && <span className="text-[9px] font-black text-red-500 uppercase mt-0.5">{t.excluded}</span>}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="font-black text-slate-900 text-lg">
                  {new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(expense.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={(e) => handleToggleClick(e, expense.id)} 
                    className={`p-2 rounded-xl transition-all ${isDisabled ? 'text-blue-600' : 'text-slate-300'}`}
                  >
                    {isDisabled ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleEditClick(e, expense)} 
                    className="p-2 text-slate-300 hover:text-blue-600 active:text-blue-700 transition-all"
                  >
                    <Edit3 size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {filteredExpenses.length > 0 && (
        <div className="p-5 md:px-8 md:py-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400 font-medium order-2 sm:order-1">
            Affichage de <span className="text-slate-700 font-bold">{Math.min(filteredExpenses.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> à <span className="text-slate-700 font-bold">{Math.min(filteredExpenses.length, currentPage * ITEMS_PER_PAGE)}</span> sur <span className="text-slate-700 font-bold">{filteredExpenses.length}</span>
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all"
              aria-label="Page précédente"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  (pageNum === 2 && currentPage > 3) ||
                  (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <span key={pageNum} className="text-slate-300 px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all"
              aria-label="Page suivante"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredExpenses.length === 0 && (
        <div className="px-8 py-20 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <Search className="text-slate-300 w-12 h-12" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">{t.noData}</h3>
          <p className="text-slate-400 max-w-xs mt-2 font-medium">{t.addExpensePrompt}</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
