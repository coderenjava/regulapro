
import React, { useState, useEffect, useCallback } from 'react';
import { Expense, CategoryBudget, Language, GroceryItem } from './types';
import { storageService } from './services/storage';
import { translations } from './translations';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Dashboard from './components/Dashboard';
import Insights from './components/Insights';
import BudgetSettings from './components/BudgetSettings';
import GroceryTracker from './components/GroceryTracker';
import { Wallet2, LayoutDashboard, History, Target, ShoppingBasket } from 'lucide-react';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget>(storageService.getBudgets());
  const [lang, setLang] = useState<Language>(storageService.getLanguage());
  const [stock, setStock] = useState<GroceryItem[]>(storageService.getGroceryStock());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'budgets' | 'stock'>('dashboard');
  const [isStoragePersisted, setIsStoragePersisted] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const initApp = async () => {
      const savedExpenses = storageService.getExpenses();
      setExpenses(savedExpenses);
      const persisted = await storageService.checkPersistence();
      setIsStoragePersisted(persisted);
    };
    initApp();
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleAddExpense = useCallback((newExpense: Expense) => {
    setExpenses(prev => {
      const expenseWithStatus = { ...newExpense, isActive: true };
      const updated = [expenseWithStatus, ...prev];
      storageService.saveExpenses(updated);
      return updated;
    });
  }, []);

  const handleUpdateExpense = useCallback((updatedExpense: Expense) => {
    setExpenses(prev => {
      const updated = prev.map(e => e.id === updatedExpense.id ? updatedExpense : e);
      storageService.saveExpenses(updated);
      return updated;
    });
  }, []);

  const handleToggleExpenseActivity = useCallback((id: string) => {
    setExpenses(prev => {
      const updated = prev.map(e => 
        e.id === id ? { ...e, isActive: e.isActive === false ? true : false } : e
      );
      storageService.saveExpenses(updated);
      return updated;
    });
  }, []);

  const handleSaveBudgets = useCallback((newBudgets: CategoryBudget) => {
    setBudgets(newBudgets);
    storageService.saveBudgets(newBudgets);
  }, []);

  const handleImportSuccess = useCallback(() => {
    setExpenses(storageService.getExpenses());
    setBudgets(storageService.getBudgets());
    setLang(storageService.getLanguage());
    setStock(storageService.getGroceryStock());
    alert(translations[storageService.getLanguage()].importSuccess);
  }, []);

  const toggleLang = useCallback((newLang: Language) => {
    setLang(newLang);
    storageService.saveLanguage(newLang);
  }, []);

  const toggleStock = useCallback((name: string) => {
    setStock(prev => {
      const updated = prev.map(item => 
        item.name === name ? { ...item, isOutOfStock: !item.isOutOfStock } : item
      );
      storageService.saveGroceryStock(updated);
      return updated;
    });
  }, []);

  const handleAddStockItem = useCallback((name: string) => {
    setStock(prev => {
      if (prev.some(item => item.name.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      const updated = [...prev, { name, isOutOfStock: false }];
      storageService.saveGroceryStock(updated);
      return updated;
    });
  }, []);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'stock', label: t.stock, icon: ShoppingBasket },
    { id: 'budgets', label: t.goals, icon: Target },
    { id: 'history', label: t.history, icon: History },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col pb-20 sm:pb-0 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-100">
                <Wallet2 className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 block">
                {t.appName}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl mr-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === item.id 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-lg">
                {(['fr', 'en', 'es', 'ar'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => toggleLang(l)}
                    className={`w-7 h-7 text-[10px] font-bold rounded flex items-center justify-center transition-all ${
                      lang === l ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="order-2 lg:order-1 lg:col-span-8 space-y-6 md:space-y-8">
            {activeTab === 'dashboard' && (
              <>
                <Dashboard expenses={expenses} budgets={budgets} lang={lang} />
                <div className="hidden md:block">
                  <ExpenseList 
                    expenses={expenses.slice(0, 5)} 
                    onUpdate={handleUpdateExpense} 
                    onToggleActivity={handleToggleExpenseActivity}
                    lang={lang} 
                  />
                </div>
              </>
            )}
            {activeTab === 'stock' && (
              <GroceryTracker stock={stock} onToggle={toggleStock} onAdd={handleAddStockItem} lang={lang} />
            )}
            {activeTab === 'history' && (
              <ExpenseList 
                expenses={expenses} 
                onUpdate={handleUpdateExpense} 
                onToggleActivity={handleToggleExpenseActivity}
                lang={lang} 
              />
            )}
            {activeTab === 'budgets' && (
              <BudgetSettings budgets={budgets} onSave={handleSaveBudgets} onImportSuccess={handleImportSuccess} lang={lang} isPersisted={isStoragePersisted} />
            )}
          </div>

          <div className="order-1 lg:order-2 lg:col-span-4 space-y-6 md:space-y-8">
            <ExpenseForm onAdd={handleAddExpense} lang={lang} />
            <Insights expenses={expenses} lang={lang} />
          </div>
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <nav className="bg-white/90 backdrop-blur-lg border border-slate-200 shadow-2xl rounded-2xl flex justify-around p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all relative ${
                activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : ''} />
              <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">
                {item.label}
              </span>
              {activeTab === item.id && (
                <span className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 mt-8 md:mt-12 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs md:text-sm">
            {t.footer}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
