
import React, { useState, useRef } from 'react';
import { PlusCircle, Calendar as CalendarIcon, Mic, MicOff, Loader2 } from 'lucide-react';
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <PlusCircle className="text-blue-500" size={20} />
          {t.newExpense}
        </h2>
        
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isParsing}
          className={`p-3 rounded-full transition-all flex items-center justify-center ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
              : isParsing
              ? 'bg-slate-100 text-slate-400'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
          title="Saisie vocale"
        >
          {isParsing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isRecording ? (
            <MicOff size={20} />
          ) : (
            <Mic size={20} />
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.title}</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.category}</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-black"
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

        <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
          {t.save}
        </button>
      </form>
      
      {isRecording && (
        <p className="text-[10px] text-red-500 font-bold mt-2 text-center animate-pulse">
          ÉCOUTE EN COURS...
        </p>
      )}
      {isParsing && (
        <p className="text-[10px] text-blue-500 font-bold mt-2 text-center">
          ANALYSE INTELLIGENTE PAR GEMINI...
        </p>
      )}
    </div>
  );
};

export default ExpenseForm;
