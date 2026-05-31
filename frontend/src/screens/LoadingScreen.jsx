import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ formData, setAiResult, onNext, onError }) => {
  const [progressText, setProgressText] = useState('Mengirim data karya...');

  useEffect(() => {
    let isMounted = true;
    
    const steps = [
      'Memproses gambar motif...',
      'Mengekstrak nilai visual via AI...',
      'Menyusun narasi filosofis...',
      'Menarik landasan hukum HAKI...'
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length && isMounted) {
        setProgressText(steps[stepIndex]);
      }
    }, 2000);

    const performAnalysis = async () => {
      try {
        const data = new FormData();
        data.append('image', formData.image);
        data.append('story', formData.story);

        const response = await fetch('http://localhost:3001/api/analyze-motif', {
          method: 'POST',
          body: data, // FormData handles multipart/form-data implicitly
        });

        if (!response.ok) {
          throw new Error('Gagal memproses data dengan AI');
        }

        const result = await response.json();

        if (isMounted) {
          clearInterval(interval);
          setAiResult({
            culturalNarrative: result.cultural_narrative || result.culturalNarrative,
            legalClauses: result.legal_clauses || result.legalClauses
          });
          onNext();
        }
      } catch (error) {
        console.error("AI Analysis Error:", error);
        if (isMounted) {
          clearInterval(interval);
          alert("Terjadi kesalahan saat menghubungi sistem AI. Pastikan server backend menyala.");
          onError();
        }
      }
    };

    performAnalysis();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [formData, setAiResult, onNext, onError]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
      <Loader2 className="w-16 h-16 text-slate-900 dark:text-slate-100 animate-spin mb-8 transition-colors" />
      
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
        Sistem AI Citraksa sedang bekerja...
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
        {progressText}
      </p>
    </div>
  );
};

export default LoadingScreen;
