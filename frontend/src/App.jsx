import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import HomeScreen from './screens/HomeScreen';
import InputScreen from './screens/InputScreen';
import LoadingScreen from './screens/LoadingScreen';
import PreviewScreen from './screens/PreviewScreen';
import SuccessScreen from './screens/SuccessScreen';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    imagePreview: null,
    story: '',
    fullName: '',
    nik: '',
    address: '',
    phone: '',
    title: '',
    publishDate: '',
    publishCity: '',
    submitCity: '',
  });
  
  const [aiResult, setAiResult] = useState({
    culturalNarrative: '',
    legalClauses: ''
  });

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const resetApp = () => {
    setCurrentStep(1);
    setFormData({
      image: null,
      imagePreview: null,
      story: '',
      fullName: '',
      nik: '',
      address: '',
      phone: '',
      title: '',
      publishDate: '',
      publishCity: '',
      submitCity: '',
    });
    setAiResult({ culturalNarrative: '', legalClauses: '' });
  };

  const handleFormDataChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans flex flex-col items-center transition-colors duration-300">
        {/* Responsive container: max-w-md on mobile, max-w-2xl on tablet, max-w-4xl on laptop */}
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl min-h-screen flex flex-col bg-white dark:bg-slate-900 shadow-xl border-x border-gray-100 dark:border-slate-800 relative transition-colors duration-300">
          
          {/* Top Header */}
          <header className="p-4 md:py-5 md:px-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 transition-colors duration-300">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Citraksa AI</h1>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col p-6 overflow-y-auto">
            {currentStep === 1 && (
              <HomeScreen onNext={nextStep} />
            )}
            
            {currentStep === 2 && (
              <InputScreen 
                formData={formData} 
                onChange={handleFormDataChange}
                onNext={nextStep} 
                onBack={() => setCurrentStep(1)} 
              />
            )}
            
            {currentStep === 3 && (
              <LoadingScreen 
                formData={formData}
                setAiResult={setAiResult}
                onNext={nextStep} 
                onError={() => setCurrentStep(2)}
              />
            )}
            
            {currentStep === 4 && (
              <PreviewScreen 
                formData={formData}
                aiResult={aiResult}
                onChange={handleFormDataChange}
                onNext={nextStep} 
                onBack={() => setCurrentStep(2)} 
              />
            )}
            
            {currentStep === 5 && (
              <SuccessScreen onReset={resetApp} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
