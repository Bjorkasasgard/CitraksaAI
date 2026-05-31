import React, { useState, useRef } from 'react';
import { ChevronLeft, FileText, Download, PenLine, Check, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';

const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
};

const PreviewScreen = ({ formData, aiResult, onChange, onNext, onBack }) => {
  const [previewStep, setPreviewStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAi, setEditedAi] = useState({ ...aiResult });
  const [isDownloading, setIsDownloading] = useState(false);
  
  // New States for Kuasa
  const [hasKuasa, setHasKuasa] = useState(false);
  const [dataKuasa, setDataKuasa] = useState({
    name: '',
    nationality: 'Indonesia',
    address: '',
    phone: ''
  });

  // Signature States
  const sigCanvas = useRef({});
  const [signatureData, setSignatureData] = useState(null);

  const handleAiChange = (key, value) => {
    setEditedAi(prev => ({ ...prev, [key]: value }));
  };

  const handleKuasaChange = (key, value) => {
    setDataKuasa(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = formData.fullName?.trim() !== '' && 
                      formData.nik?.trim() !== '' && 
                      formData.address?.trim() !== '' &&
                      formData.title?.trim() !== '';

  const handleCompleteStep2 = () => {
    if (sigCanvas.current.isEmpty()) {
      alert('Mohon bubuhkan tanda tangan Anda terlebih dahulu!');
      return;
    }
    setSignatureData(sigCanvas.current.getCanvas().toDataURL('image/png'));
    setPreviewStep(3);
  };

  const generatePDFLocally = async () => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    
    const fontNormal = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const { width, height } = page.getSize();
    let currentY = 800; // Starting near top
    const margin = 50;

    const checkMargin = (requiredSpace = 20) => {
      if (currentY - requiredSpace < margin) {
        page = pdfDoc.addPage([595.28, 841.89]);
        currentY = height - margin;
      }
    };

    const drawBlock = (lines, startX, startY, font, size) => {
      let y = startY;
      lines.forEach(line => {
        page.drawText(line, { x: startX, y, size, font, color: rgb(0, 0, 0) });
        y -= (size + 3);
      });
      return y;
    };

    // 1. Header Kanan Atas
    currentY = drawBlock([
      'Lampiran I',
      'Peraturan Menteri Kehakiman R.I.',
      'Nomor : M.01-HC.03.01 Tahun 1987'
    ], 350, currentY, fontNormal, 11);
    
    currentY -= 20;

    // 2. Tujuan Surat
    currentY = drawBlock([
      'Kepada Yth. :',
      'Direktur Jenderal HKI',
      'melalui Direktur Hak Cipta,',
      'Desain Industri, Desain Tata Letak,',
      'Sirkuit Terpadu dan Rahasia Dagang',
      'di Jakarta'
    ], 350, currentY, fontNormal, 11);

    currentY -= 30;

    // 3. Judul Dokumen (Tengah)
    const titleText = 'PERMOHONAN PENDAFTARAN CIPTAAN';
    const titleSize = 12;
    const titleWidth = fontBold.widthOfTextAtSize(titleText, titleSize);
    const titleX = (width - titleWidth) / 2;
    page.drawText(titleText, { x: titleX, y: currentY, size: titleSize, font: fontBold, color: rgb(0,0,0) });
    page.drawLine({
      start: { x: titleX, y: currentY - 2 },
      end: { x: titleX + titleWidth, y: currentY - 2 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });

    currentY -= 30;

    const drawRow = (label, value, isBold = false) => {
      checkMargin(15);
      page.drawText(label, { x: 80, y: currentY, size: 11, font: fontNormal, color: rgb(0,0,0) });
      page.drawText(':', { x: 220, y: currentY, size: 11, font: fontNormal, color: rgb(0,0,0) });
      
      const valFont = isBold ? fontBold : fontNormal;
      page.drawText(value, { x: 230, y: currentY, size: 11, font: valFont, color: rgb(0,0,0) });
      currentY -= 15;
    };

    // Prepare Title Cased Variables
    const tcFullName = toTitleCase(formData.fullName || '-');
    const tcAddress = toTitleCase(formData.address || '-');
    const tcPublishCity = toTitleCase(formData.publishCity || '-');
    const tcKuasaName = toTitleCase(dataKuasa.name || '-');
    const tcKuasaAddress = toTitleCase(dataKuasa.address || '-');

    // 4. Poin I - III (Data Subjek)
    page.drawText('I.', { x: 50, y: currentY, size: 11, font: fontNormal });
    page.drawText('Pencipta', { x: 80, y: currentY, size: 11, font: fontNormal });
    currentY -= 15;
    drawRow('Nama', tcFullName);
    drawRow('Kewarganegaraan', 'Indonesia');
    drawRow('Alamat', tcAddress);
    drawRow('Telepon/E-mail', formData.phone || formData.email || '-');

    currentY -= 10;
    checkMargin(15);
    page.drawText('II.', { x: 50, y: currentY, size: 11, font: fontNormal });
    page.drawText('Pemegang Hak Cipta', { x: 80, y: currentY, size: 11, font: fontNormal });
    currentY -= 15;
    drawRow('Nama', tcFullName);
    drawRow('Kewarganegaraan', 'Indonesia');
    drawRow('Alamat', tcAddress);
    drawRow('Telepon/E-mail', formData.phone || formData.email || '-');

    currentY -= 10;
    checkMargin(15);
    page.drawText('III.', { x: 50, y: currentY, size: 11, font: fontNormal });
    
    if (!hasKuasa) {
      page.drawText('Kuasa', { x: 80, y: currentY, size: 11, font: fontNormal });
      page.drawText(':', { x: 220, y: currentY, size: 11, font: fontNormal });
      page.drawText('-', { x: 230, y: currentY, size: 11, font: fontNormal });
      currentY -= 15;
    } else {
      page.drawText('Kuasa', { x: 80, y: currentY, size: 11, font: fontNormal });
      currentY -= 15;
      drawRow('Nama', tcKuasaName);
      drawRow('Kewarganegaraan', dataKuasa.nationality || 'Indonesia');
      drawRow('Alamat', tcKuasaAddress);
      drawRow('Telepon/E-mail', dataKuasa.phone || '-');
    }

    currentY -= 10;

    // 5. Poin IV - V (Data Ciptaan)
    checkMargin(15);
    page.drawText('IV.', { x: 50, y: currentY, size: 11, font: fontNormal });
    page.drawText('Jenis dan judul ciptaan yang dimohonkan', { x: 80, y: currentY, size: 11, font: fontNormal });
    page.drawText(':', { x: 300, y: currentY, size: 11, font: fontNormal });
    page.drawText(`Karya Seni Rupa Motif Batik - ${toTitleCase(formData.title) || '-'}`, { x: 310, y: currentY, size: 11, font: fontBold });
    currentY -= 25;

    checkMargin(15);
    page.drawText('V.', { x: 50, y: currentY, size: 11, font: fontNormal });
    page.drawText('Tanggal dan tempat diumumkan untuk', { x: 80, y: currentY, size: 11, font: fontNormal });
    currentY -= 15;
    page.drawText('pertama kali di wilayah Indonesia', { x: 80, y: currentY, size: 11, font: fontNormal });
    page.drawText(':', { x: 300, y: currentY, size: 11, font: fontNormal });
    page.drawText(`${formData.publishDate || '-'}, di ${tcPublishCity}`, { x: 310, y: currentY, size: 11, font: fontNormal });
    currentY -= 25;

    // 6. Poin VI (Uraian Ciptaan) - FORCED PAGE BREAK
    page = pdfDoc.addPage([595.28, 841.89]);
    currentY = height - margin;

    page.drawText('VI.', { x: 50, y: currentY, size: 11, font: fontNormal });
    page.drawText('Uraian ciptaan :', { x: 80, y: currentY, size: 11, font: fontNormal });
    currentY -= 25;

    if (formData.image) {
      try {
        const imageBuffer = await formData.image.arrayBuffer();
        let pdfImage;
        const mimeType = formData.image.type;

        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(imageBuffer);
        } else if (mimeType === 'image/png') {
          pdfImage = await pdfDoc.embedPng(imageBuffer);
        }

        if (pdfImage) {
          const imgDims = pdfImage.scaleToFit(250, 250);
          checkMargin(imgDims.height + 20);
          
          const imgX = (width - imgDims.width) / 2;
          const imgY = currentY - imgDims.height;

          page.drawImage(pdfImage, {
            x: imgX,
            y: imgY,
            width: imgDims.width,
            height: imgDims.height,
          });

          currentY = imgY - 30; 
        }
      } catch (err) {
        console.error("Gagal menyematkan gambar:", err);
      }
    }

    // JUSTIFIED TEXT WRAP ALGORITHM
    const drawJustifiedText = (text, font, size, x, maxLineW, lineHeight = 1.3) => {
      const actualLineHeight = size * lineHeight;
      const paragraphs = text.split('\n').filter(p => p.trim() !== '');

      for (const p of paragraphs) {
        const words = p.split(' ');
        let lineWords = [];
        let currentLineWidth = 0;

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const wordWidth = font.widthOfTextAtSize(word, size);
          const spaceWidth = font.widthOfTextAtSize(' ', size);

          const testWidth = currentLineWidth + (lineWords.length > 0 ? spaceWidth : 0) + wordWidth;

          if (testWidth > maxLineW && lineWords.length > 0) {
            checkMargin(actualLineHeight);
            
            const totalWordWidth = lineWords.reduce((sum, w) => sum + font.widthOfTextAtSize(w, size), 0);
            const remainingSpace = maxLineW - totalWordWidth;
            const gaps = lineWords.length - 1;
            const extraSpace = gaps > 0 ? remainingSpace / gaps : 0;

            let currentX = x;
            for (const lw of lineWords) {
              page.drawText(lw, { x: currentX, y: currentY, size, font, color: rgb(0, 0, 0) });
              currentX += font.widthOfTextAtSize(lw, size) + extraSpace;
            }

            currentY -= actualLineHeight;
            lineWords = [word];
            currentLineWidth = wordWidth;
          } else {
            lineWords.push(word);
            currentLineWidth = testWidth;
          }
        }

        if (lineWords.length > 0) {
          checkMargin(actualLineHeight);
          let currentX = x;
          const spaceWidth = font.widthOfTextAtSize(' ', size);
          for (const lw of lineWords) {
            page.drawText(lw, { x: currentX, y: currentY, size, font, color: rgb(0, 0, 0) });
            currentX += font.widthOfTextAtSize(lw, size) + spaceWidth;
          }
          currentY -= actualLineHeight;
        }
        currentY -= 5;
      }
    };

    const indentX = 100;
    const textMaxWidth = width - indentX - margin;

    const cleanNarrative = (editedAi.culturalNarrative || 'N/A').replace(/\*\*/g, '');
    checkMargin(30);
    page.drawText('Narasi Kultural & Filosofis Karya:', { x: indentX, y: currentY, size: 11, font: fontBold });
    currentY -= 15;
    drawJustifiedText(cleanNarrative, fontNormal, 11, indentX, textMaxWidth, 1.5);
    currentY -= 5;

    const cleanLegal = (editedAi.legalClauses || 'N/A').replace(/\*\*/g, '');
    checkMargin(30);
    page.drawText('Landasan Hukum Perlindungan:', { x: indentX, y: currentY, size: 11, font: fontBold });
    currentY -= 15;
    drawJustifiedText(cleanLegal, fontNormal, 11, indentX, textMaxWidth, 1.5);

    // 7. Penutup (Signature)
    if (currentY < 120) {
      page = pdfDoc.addPage([595.28, 841.89]);
      currentY = height - margin;
    }

    const signatureX = 350;
    const submitCity = toTitleCase(formData.submitCity || 'Sukabumi');
    const submitDate = formData.submitDate || new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
    
    page.drawText(`${submitCity}, ${submitDate}`, { x: signatureX, y: currentY - 40, size: 11, font: fontNormal });
    
    // Embed Signature PNG
    if (signatureData) {
      try {
        const sigImage = await pdfDoc.embedPng(signatureData);
        // Scale down the signature proportionally
        const sigDims = sigImage.scaleToFit(150, 60); 
        
        // Draw the signature above the name
        page.drawImage(sigImage, {
          x: signatureX + 10,
          y: currentY - 105,
          width: sigDims.width,
          height: sigDims.height,
        });
      } catch (e) {
        console.error("Gagal memproses tanda tangan:", e);
      }
    }

    const creatorName = (formData.fullName || 'ADAM BASTIAN CHANIAGO').toUpperCase();
    const nameWidth = fontBold.widthOfTextAtSize(creatorName, 11);
    
    page.drawText(creatorName, { x: signatureX, y: currentY - 110, size: 11, font: fontBold });
    page.drawLine({
      start: { x: signatureX, y: currentY - 112 },
      end: { x: signatureX + nameWidth, y: currentY - 112 },
      thickness: 1,
      color: rgb(0, 0, 0)
    });

    return await pdfDoc.save();
  };

  const handleActionPdf = async (action) => {
    setIsDownloading(true);
    try {
      const pdfBytes = await generatePDFLocally();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      if (action === 'preview') {
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      } else if (action === 'download') {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Form_HakCipta.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      }
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Terjadi kesalahan saat merakit dokumen PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header and Stepper */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center">
          <button onClick={() => {
            if (previewStep === 3) {
              setPreviewStep(2);
            } else if (previewStep === 2) {
              setPreviewStep(1);
            } else {
              onBack();
            }
          }} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white ml-2 transition-colors">Finalisasi Dokumen</h2>
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium ml-10 mt-1 transition-colors">
          Langkah {previewStep} dari 3: {
            previewStep === 1 ? 'Review Narasi AI' : 
            previewStep === 2 ? 'Lengkapi Data Administratif' : 
            'Berhasil!'
          }
        </p>
      </div>

      {/* STEP 1: Review Narasi */}
      {previewStep === 1 && (
        <div className="flex-1 flex flex-col overflow-y-auto pb-6 pr-2">
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isEditing ? <><Check className="w-4 h-4 mr-1" /> Simpan</> : <><PenLine className="w-4 h-4 mr-1" /> Edit Narasi</>}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Narasi Kultural</h3>
              {isEditing ? (
                <textarea 
                  className="w-full text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded p-2 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 focus:outline-none min-h-[150px]"
                  value={editedAi.culturalNarrative}
                  onChange={(e) => handleAiChange('culturalNarrative', e.target.value)}
                />
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{editedAi.culturalNarrative}</p>
              )}
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Landasan Hukum</h3>
              {isEditing ? (
                <textarea 
                  className="w-full text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded p-2 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 focus:outline-none min-h-[150px]"
                  value={editedAi.legalClauses}
                  onChange={(e) => handleAiChange('legalClauses', e.target.value)}
                />
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{editedAi.legalClauses}</p>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4">
            <button 
              onClick={() => setPreviewStep(2)}
              className="w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center transition-all shadow-sm bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white active:scale-95"
            >
              Lanjut Isi Data Administratif <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Lengkapi Data Administratif & TTD */}
      {previewStep === 2 && (
        <div className="flex-1 flex flex-col overflow-y-auto pb-6 pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 transition-colors">Judul Ciptaan (Motif)</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder="Contoh: Motif Mega Mendung"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 transition-colors">Nama Lengkap Pemilik Karya</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                placeholder="Sesuai KTP"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 transition-colors">Nomor Induk Kependudukan (NIK)</label>
              <input 
                type="text" 
                value={formData.nik}
                onChange={(e) => onChange('nik', e.target.value)}
                placeholder="16 Digit Angka"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 transition-colors">Telepon / Email</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="08123xxx / email@anda.com"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 transition-colors">Alamat Domisili</label>
              <textarea 
                value={formData.address}
                onChange={(e) => onChange('address', e.target.value)}
                placeholder="Alamat lengkap sesuai KTP"
                rows={1}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 resize-none transition-colors"
              />
            </div>
            
            {/* Section Kuasa (Conditional Rendering) */}
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl mt-2 transition-colors">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasKuasa}
                  onChange={(e) => setHasKuasa(e.target.checked)}
                  className="w-5 h-5 text-slate-900 dark:text-slate-700 border-slate-300 rounded focus:ring-slate-900 dark:focus:ring-slate-500"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gunakan Kuasa/Konsultan?</span>
              </label>

              {hasKuasa && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 transition-colors">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nama Lengkap Kuasa</label>
                    <input 
                      type="text" 
                      value={dataKuasa.name}
                      onChange={(e) => handleKuasaChange('name', e.target.value)}
                      placeholder="Nama Konsultan/Kuasa"
                      className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Kewarganegaraan</label>
                    <input 
                      type="text" 
                      value={dataKuasa.nationality}
                      onChange={(e) => handleKuasaChange('nationality', e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Telepon / Email Kuasa</label>
                    <input 
                      type="text" 
                      value={dataKuasa.phone}
                      onChange={(e) => handleKuasaChange('phone', e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Alamat Kuasa</label>
                    <textarea 
                      value={dataKuasa.address}
                      onChange={(e) => handleKuasaChange('address', e.target.value)}
                      rows={2}
                      className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tgl Publikasi Perdana</label>
                <input 
                  type="text" 
                  value={formData.publishDate}
                  onChange={(e) => onChange('publishDate', e.target.value)}
                  placeholder="Misal: 10 Mei 2026"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Kota Publikasi</label>
                <input 
                  type="text" 
                  value={formData.publishCity}
                  onChange={(e) => onChange('publishCity', e.target.value)}
                  placeholder="Misal: Surakarta"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Kota Pengajuan</label>
                <input 
                  type="text" 
                  value={formData.submitCity}
                  onChange={(e) => onChange('submitCity', e.target.value)}
                  placeholder="Misal: Jakarta"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500"
                />
              </div>
            </div>

            {/* Electronic Signature Box */}
            <div className="md:col-span-2 mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Tanda Tangan Pemohon</label>
                <button 
                  onClick={() => sigCanvas.current.clear()}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Hapus / Ulangi TTD
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-200 overflow-hidden transition-colors">
                <SignatureCanvas 
                  ref={sigCanvas} 
                  penColor="black"
                  canvasProps={{ className: 'w-full h-32 cursor-crosshair' }} 
                />
              </div>
            </div>

          </div>

          <div className="flex flex-col mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
            <button 
              onClick={handleCompleteStep2}
              disabled={!isFormValid}
              className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center transition-all shadow-sm border border-transparent
                ${(!isFormValid)
                  ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-white active:scale-95' 
                }
              `}
            >
              <FileText className="w-5 h-5 mr-2" /> Selesai & Buat Dokumen
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Success Screen */}
      {previewStep === 3 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce transition-colors">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">Selamat!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-sm leading-relaxed transition-colors">
            Dokumen Persiapan Pendaftaran Hak Cipta Anda telah berhasil dibuat lengkap dengan tanda tangan digital Anda.
          </p>

          <div className="w-full flex flex-col sm:flex-row gap-3 mt-auto">
            <button 
              onClick={() => handleActionPdf('preview')}
              disabled={isDownloading}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold flex items-center justify-center transition-all shadow-sm border-2
                ${isDownloading 
                  ? 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 cursor-not-allowed'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white active:scale-95'
                }
              `}
            >
              {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileText className="w-5 h-5 mr-2" /> Lihat Pratinjau</>}
            </button>

            <button 
              onClick={() => handleActionPdf('download')}
              disabled={isDownloading}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold flex items-center justify-center transition-all shadow-sm border border-transparent
                ${isDownloading
                  ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-white active:scale-95' 
                }
              `}
            >
              {isDownloading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Mengunduh...</>
              ) : (
                <><Download className="w-5 h-5 mr-2" /> Unduh Dokumen</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewScreen;
