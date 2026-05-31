import React from 'react';
import { ShieldCheck } from 'lucide-react';

const HomeScreen = ({ onNext }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center">
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-full mb-8 transition-colors">
        <ShieldCheck className="w-16 h-16 text-slate-900 dark:text-slate-100" />
      </div>
      
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight transition-colors">
        Lindungi Karya<br/>Kriya Anda
      </h2>
      
      <p className="text-gray-500 dark:text-slate-400 mb-12 text-lg transition-colors">
        Asisten legal pintar untuk mendigitalkan pendaftaran HAKI motif tradisional Anda dalam hitungan detik.
      </p>
      
      <button 
        onClick={onNext}
        className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md active:scale-95 border border-transparent dark:border-slate-700"
      >
        Mulai Daftarkan Karyamu
      </button>
    </div>
  );
};

export default HomeScreen;
