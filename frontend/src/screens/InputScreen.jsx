import React, { useRef } from 'react';
import { Camera, ChevronLeft, Upload, Image as ImageIcon } from 'lucide-react';

const InputScreen = ({ formData, onChange, onNext, onBack }) => {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 5MB.");
        return;
      }
      onChange('image', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange('imagePreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = formData.image !== null && formData.story.trim().length > 10;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white ml-2 transition-colors">Detail Karya</h2>
      </div>

      {/* Responsive layout wrapper for image and story */}
      <div className="flex flex-col md:flex-row md:gap-6 mb-6 flex-1">
        
        {/* Image Upload Area */}
        <div className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors overflow-hidden ${
            formData.imagePreview 
              ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50' 
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-transparent min-h-[12rem] md:min-h-full'
          }`}
        >
        <input 
          type="file" 
          ref={cameraInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          capture="environment"
          className="hidden" 
        />
        <input 
          type="file" 
          ref={galleryInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        
        {formData.imagePreview ? (
          <div className="relative w-full h-48 group">
            <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="bg-white text-slate-900 p-2 rounded-full hover:bg-slate-200"
                title="Foto Ulang"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="bg-white text-slate-900 p-2 rounded-full hover:bg-slate-200"
                title="Pilih Ulang dari Galeri"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 w-full flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Unggah / Foto Motif Karya Anda</p>
            <div className="flex flex-row gap-3 w-full max-w-xs justify-center">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <Camera className="w-6 h-6 text-slate-600 dark:text-slate-300 mb-2" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kamera</span>
              </button>
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <ImageIcon className="w-6 h-6 text-slate-600 dark:text-slate-300 mb-2" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Galeri</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">JPG, PNG (Maks 5MB)</p>
          </div>
        )}
      </div>

        {/* Story Input Area */}
        <div className="flex-1 flex flex-col mt-6 md:mt-0">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
          Cerita & Makna Karya
        </label>
        <textarea
          value={formData.story}
          onChange={(e) => onChange('story', e.target.value)}
          placeholder="Contoh: Ini batik motif ombak, maknanya melambangkan perjuangan yang tidak pernah putus..."
          className="w-full flex-1 min-h-[150px] p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 focus:border-transparent resize-none transition-colors"
          maxLength={500}
        />
        <div className="text-right text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">
          {formData.story.length}/500
        </div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={onNext}
        disabled={!isFormValid}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all shadow-sm border
          ${isFormValid 
            ? 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border-transparent dark:border-slate-700 active:scale-95' 
            : 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-transparent dark:border-slate-800 cursor-not-allowed'
          }
        `}
      >
        Analisis Karya
      </button>
    </div>
  );
};

export default InputScreen;
