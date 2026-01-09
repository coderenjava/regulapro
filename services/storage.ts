
import { Expense, CategoryBudget, Language, GroceryItem } from '../types';

const STORAGE_KEY = 'smartspend_data';
const BUDGET_KEY = 'smartspend_budgets';
const LANG_KEY = 'smartspend_lang';
const STOCK_KEY = 'smartspend_stock';

const DEFAULT_BUDGETS: CategoryBudget = {
  'Courses': 300,
  'Shopping': 150,
  'Loisirs': 100,
  'Transport': 100,
  'Santé': 50,
  'Logement': 800,
  'Autres': 100
};

const DEFAULT_PRODUCTS = [
  "Poulet", "Viande", "Lait", "Œufs", "Gâteaux", "Boissons", "Fruits", "Yaourt", 
  "Chocolat", "Pain", "Blanc Poulet", "Saumon", "Frites", "Potatos", "Pizza", 
  "Tomates", "Patates", "Oignions", "Riz", "Spaghetti", "Borata", "Fromage"
];

export const storageService = {
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveExpenses: (expenses: Expense[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  },

  getBudgets: (): CategoryBudget => {
    const data = localStorage.getItem(BUDGET_KEY);
    return data ? JSON.parse(data) : DEFAULT_BUDGETS;
  },

  saveBudgets: (budgets: CategoryBudget): void => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  },

  getLanguage: (): Language => {
    return (localStorage.getItem(LANG_KEY) as Language) || 'fr';
  },

  saveLanguage: (lang: Language): void => {
    localStorage.setItem(LANG_KEY, lang);
  },

  getGroceryStock: (): GroceryItem[] => {
    const data = localStorage.getItem(STOCK_KEY);
    if (!data) {
      return DEFAULT_PRODUCTS.map(name => ({ name, isOutOfStock: false }));
    }
    return JSON.parse(data);
  },

  saveGroceryStock: (stock: GroceryItem[]): void => {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
  },

  checkPersistence: async (): Promise<boolean> => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    }
    return false;
  },

  exportAllData: (): string => {
    const fullData = {
      expenses: storageService.getExpenses(),
      budgets: storageService.getBudgets(),
      lang: storageService.getLanguage(),
      stock: storageService.getGroceryStock()
    };
    return JSON.stringify(fullData, null, 2);
  },

  importAllData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.expenses) storageService.saveExpenses(data.expenses);
      if (data.budgets) storageService.saveBudgets(data.budgets);
      if (data.lang) storageService.saveLanguage(data.lang);
      if (data.stock) storageService.saveGroceryStock(data.stock);
      return true;
    } catch (e) {
      console.error("Import error", e);
      return false;
    }
  }
};
