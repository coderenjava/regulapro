
export type Category = 'Courses' | 'Shopping' | 'Loisirs' | 'Transport' | 'Santé' | 'Logement' | 'Autres';

export type Language = 'fr' | 'en' | 'es' | 'ar';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: Category;
  note?: string;
  isActive?: boolean; // Nouvelle propriété
}

export type CategoryBudget = Record<Category, number>;

export interface Insight {
  tip: string;
  analysis: string;
  recommendations: string[];
}

export interface GroceryItem {
  name: string;
  isOutOfStock: boolean;
}
