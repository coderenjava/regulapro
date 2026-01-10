
import React, { useState, useRef } from 'react';
import { PlusCircle, Calendar as CalendarIcon, Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { Expense, Category, Language } from '../types';
import { CATEGORIES } from '../constants';
import { translations } from '../translations';
import { parseExpenseFromVoice } from '../services/geminiService';

interface ExpenseFormProps {
  onAdd: (expense: Expense) => void;
  lang: Language;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, lang }) => {
  const t = translations[lang];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Courses');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isAiAvailable = !!process.env.API_KEY && process.env.API_KEY.length > 0;

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExpense: Expense = {
      id: generateId(),
      title,
      amount: parseFloat(amount),
      category,
      date,
    };

    onAdd(newExpense);
    setTitle('');
    setAmount('');
  };

  const setQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().split('T')[0]);
  };

  const isToday = date === new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date === yesterday.toISOString().split('T')[0];

  const startRecording = async () => {
    if (!isAiAvailable) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setIsParsing(true);
          const result = await parseExpenseFromVoice(base64Data, 'audio/webm', lang);
          if (result) {
            if (result.title) setTitle(result.title);
            if (result.amount) setAmount(result.amount.toString());
            if (result.category) setCategory(result.category as Category);
            if (result.date) setDate(result.date);
          }
          setIsParsing(false);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
      {/* Decorative AI Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl transition-opacity duration-500 ${isRecording || isParsing ? 'opacity-100' : 'opacity-0'}`} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <PlusCircle className="text-blue-500" size={20} />
          {t.newExpense}
        </h2>
        
        {isAiAvailable && (
          <div className="relative">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isParsing}
              className={`p-3.5 rounded-2xl transition-all flex items-center justify-center group relative ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-xl shadow-red-200' 
                  : isParsing
                  ? 'bg-indigo-100 text-indigo-400'
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-110'
              }`}
              title={t.iaVoiceReady}
            >
              {isParsing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isRecording ? (
                <MicOff size={20} />
              ) : (
                <div className="flex items-center gap-2">
                   <Mic size={20} />
                   <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.title}</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.amount}</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.category}</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-black transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{t.categories[cat]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-semibold text-slate-700">{t.date}</label>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setQuickDate(0)} 
                className={`text-[10px] px-2.5 py-1.5 rounded-lg font-black transition-all ${
                  isToday 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t.today}
              </button>
              <button 
                type="button" 
                onClick={() => setQuickDate(1)} 
                className={`text-[10px] px-2.5 py-1.5 rounded-lg font-black transition-all ${
                  isYesterday 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t.yesterday}
              </button>
            </div>
          </div>
          <input
            type="date"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-black"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]">
          {t.save}
        </button>
      </form>
      
      {isRecording && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
          <p className="text-[10px] text-red-500 font-black uppercase tracking-widest animate-pulse">
            ÉCOUTE EN COURS...
          </p>
        </div>
      )}
      {isParsing && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-indigo-500 animate-spin" />
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">
            {t.iaThinking}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
