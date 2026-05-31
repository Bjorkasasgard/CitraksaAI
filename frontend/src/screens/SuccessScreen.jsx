import React from 'react';
import { CheckCircle2, Home } from 'lucide-react';

const SuccessScreen = ({ onReset }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center">
      <div className="mb-6 animate-bounce">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">
        Dokumen HAKI Selesai!
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 mb-10 px-4 transition-colors">
        Dokumen legal Anda berhasil dibuat dan otomatis terunduh (PDF). Data sementara Anda telah dihapus dari sistem demi keamanan.
      </p>
      
      <button 
        onClick={onReset}
        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-4 px-6 rounded-xl flex items-center justify-center transition-colors shadow-sm"
      >
        <Home className="w-5 h-5 mr-2" />
        Kembali ke Beranda
      </button>
    </div>
  );
};

export default SuccessScreen;
