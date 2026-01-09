
import React, { useState } from 'react';
import { Package, PackageX, CheckCircle, ShoppingCart, PlusCircle } from 'lucide-react';
import { GroceryItem, Language } from '../types';
import { translations } from '../translations';

interface GroceryTrackerProps {
  stock: GroceryItem[];
  onToggle: (name: string) => void;
  onAdd: (name: string) => void;
  lang: Language;
}

const GroceryTracker: React.FC<GroceryTrackerProps> = ({ stock, onToggle, onAdd, lang }) => {
  const t = translations[lang];
  const [newItemName, setNewItemName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName.trim());
      setNewItemName('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <ShoppingCart size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{t.stockTitle}</h2>
          </div>
          <p className="text-slate-500 text-sm">{t.stockSubtitle}</p>
        </div>

        <form onSubmit={handleAddSubmit} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t.addProductPlaceholder}
            className="flex-grow md:w-48 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black text-sm"
          />
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">{t.addProductButton}</span>
          </button>
        </form>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {stock.map((item) => (
            <button
              key={item.name}
              onClick={() => onToggle(item.name)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 group relative ${
                item.isOutOfStock 
                ? 'bg-red-50 border-red-200 text-red-700 shadow-sm scale-[0.98]' 
                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <div className={`mb-2 p-2 rounded-full transition-colors ${
                item.isOutOfStock ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'
              }`}>
                {item.isOutOfStock ? <PackageX size={20} /> : <Package size={20} />}
              </div>
              <span className={`text-xs font-bold text-center leading-tight ${item.isOutOfStock ? 'line-through opacity-70' : ''}`}>
                {t.products[item.name] || item.name}
              </span>
              
              {item.isOutOfStock && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full shadow-sm">
                  <PackageX size={10} />
                </div>
              )}
              {!item.isOutOfStock && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white p-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle size={10} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroceryTracker;
