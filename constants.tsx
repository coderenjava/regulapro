
import React from 'react';
import { ShoppingCart, ShoppingBag, Gamepad2, Car, HeartPulse, Home, MoreHorizontal } from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Courses',
  'Shopping',
  'Loisirs',
  'Transport',
  'Santé',
  'Logement',
  'Autres'
];

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  'Courses': <ShoppingCart className="w-5 h-5" />,
  'Shopping': <ShoppingBag className="w-5 h-5" />,
  'Loisirs': <Gamepad2 className="w-5 h-5" />,
  'Transport': <Car className="w-5 h-5" />,
  'Santé': <HeartPulse className="w-5 h-5" />,
  'Logement': <Home className="w-5 h-5" />,
  'Autres': <MoreHorizontal className="w-5 h-5" />
};

export const CATEGORY_COLORS: Record<Category, string> = {
  'Courses': '#3b82f6', // blue-500
  'Shopping': '#ec4899', // pink-500
  'Loisirs': '#8b5cf6', // violet-500
  'Transport': '#f59e0b', // amber-500
  'Santé': '#10b981', // emerald-500
  'Logement': '#ef4444', // red-500
  'Autres': '#64748b'  // slate-500
};
