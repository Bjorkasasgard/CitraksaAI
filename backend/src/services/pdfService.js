import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generates a PDF containing the user's data and AI-generated narratives.
 * @param {Object} data
 * @param {string} data.fullName
 * @param {string} data.nik
 * @param {string} data.address
 * @param {string} data.culturalNarrative
 * @param {string} data.legalClauses
 * @param {Buffer} data.imageBuffer
 * @param {string} data.mimeType
 * @returns {Promise<Uint8Array>} The PDF file as a byte array (buffer).
 */
export const generateHakiDocument = async (data) => {
  const { fullName, nik, address, culturalNarrative, legalClauses, imageBuffer, mimeType } = data;

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Add a blank page (A4 size)
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 points

  // Embed standard fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const { width, height } = page.getSize();
  const margin = 50;
  const maxWidth = width - margin * 2; // ~495.28 units
  let currentY = height - margin;

  // 1. HEADER EKSKLUSIF
  const title = 'DOKUMEN PERSIAPAN PENDAFTARAN CIPTAAN';
  const titleSize = 16;
  const titleWidth = timesRomanBoldFont.widthOfTextAtSize(title, titleSize);
  
  page.drawText(title, {
    x: (width - titleWidth) / 2, // Centered
    y: currentY,
    size: titleSize,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });
  
  currentY -= 15;

  // Draw Horizontal Line (Divider)
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: width - margin, y: currentY },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7), // Gray line
  });

  currentY -= 30;

  // Helper function for text-wrapping
  const drawTextWrapped = (text, font, size, x, y, maxLineW, lineHeight = 1.3) => {
    const words = text.replace(/\n/g, ' ').split(' ');
    let line = '';
    let currentLineY = y;
    const actualLineHeight = size * lineHeight;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const textWidth = font.widthOfTextAtSize(testLine, size);
      
      if (textWidth > maxLineW && i > 0) {
        page.drawText(line, { x, y: currentLineY, size, font, color: rgb(0, 0, 0) });
        line = words[i] + ' ';
        currentLineY -= actualLineHeight;
      } else {
        line = testLine;
      }
    }
    
    // Draw the remaining text
    page.drawText(line, { x, y: currentLineY, size, font, color: rgb(0, 0, 0) });
    return currentLineY - (actualLineHeight + 10); // Return next Y position with some margin bottom
  };

  // 2. DATA PENCIPTA (ATAS)
  page.drawText('Data Pencipta:', { x: margin, y: currentY, size: 12, font: timesRomanBoldFont });
  currentY -= 20;
  
  currentY = drawTextWrapped(`Nama Lengkap: ${fullName}`, timesRomanFont, 11, margin, currentY, maxWidth);
  currentY = drawTextWrapped(`NIK: ${nik}`, timesRomanFont, 11, margin, currentY, maxWidth);
  currentY = drawTextWrapped(`Alamat Domisili: ${address}`, timesRomanFont, 11, margin, currentY, maxWidth);
  currentY -= 10; // Extra spacing before image

  // 3. GAMBAR KARYA (TENGAH)
  if (imageBuffer) {
    let pdfImage;
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      pdfImage = await pdfDoc.embedJpg(imageBuffer);
    } else if (mimeType === 'image/png') {
      pdfImage = await pdfDoc.embedPng(imageBuffer);
    }

    if (pdfImage) {
      // Scale to fit 250x250 while maintaining aspect ratio
      const imgDims = pdfImage.scaleToFit(250, 250);
      
      // Center the image horizontally
      const imgX = (width - imgDims.width) / 2;
      const imgY = currentY - imgDims.height;

      page.drawImage(pdfImage, {
        x: imgX,
        y: imgY,
        width: imgDims.width,
        height: imgDims.height,
      });

      // 4. KALKULASI Y-AXIS DINAMIS
      currentY = imgY - 30; // Move Y below the image plus padding
    }
  }

  // 5. TEKS NARASI & HUKUM (BAWAH)
  
  // Narasi Kultural
  page.drawText('Narasi Kultural & Filosofis Karya:', { x: margin, y: currentY, size: 12, font: timesRomanBoldFont });
  currentY -= 20;
  currentY = drawTextWrapped(culturalNarrative || 'N/A', timesRomanFont, 11, margin, currentY, maxWidth, 1.5);
  currentY -= 10;

  // Landasan Hukum
  page.drawText('Landasan Hukum Perlindungan:', { x: margin, y: currentY, size: 12, font: timesRomanBoldFont });
  currentY -= 20;
  drawTextWrapped(legalClauses || 'N/A', timesRomanFont, 11, margin, currentY, maxWidth, 1.5);

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
