const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class PDFService {
  async generateCombinedPDF(files, year, month) {
    const mergedPdf = await PDFDocument.create();
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    for (const file of files) {
      const filePath = path.join(uploadPath, `${year}-${month}`, file.storedName);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }
      
      try {
        if (file.type === 'application/pdf') {
          // Add PDF directly
          const pdfBytes = fs.readFileSync(filePath);
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        } else if (file.type.startsWith('image/')) {
          // Convert image to PDF and add
          const imagePdfBytes = await this.convertImageToPdf(filePath, file.type);
          const imagePdf = await PDFDocument.load(imagePdfBytes);
          const copiedPages = await mergedPdf.copyPages(imagePdf, imagePdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
    
    // Save the merged PDF
    const pdfBytes = await mergedPdf.save();
    return Buffer.from(pdfBytes);
  }
  
  async convertImageToPdf(imagePath, mimeType) {
    // Read image and convert to PNG for embedding
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Use sharp to get image dimensions and convert if needed
    const sharpImage = sharp(imageBuffer);
    const metadata = await sharpImage.metadata();
    
    // Resize if image is too large (max 2000px on longest side)
    let processedBuffer = imageBuffer;
    const maxDimension = 2000;
    
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      processedBuffer = await sharpImage
        .resize(maxDimension, maxDimension, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
    }
    
    // Create a new PDF with the image
    const pdfDoc = await PDFDocument.create();
    
    // Calculate page size to fit image
    const pageWidth = metadata.width > maxDimension ? 
      (metadata.width / metadata.height) * maxDimension : metadata.width;
    const pageHeight = metadata.height > maxDimension ? 
      (metadata.height / metadata.width) * maxDimension : metadata.height;
    
    // Add some margin
    const margin = 20;
    const page = pdfDoc.addPage([pageWidth + margin * 2, pageHeight + margin * 2]);
    
    // Embed the image
    let embeddedImage;
    if (mimeType === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(processedBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(processedBuffer);
    }
    
    // Draw image centered on page
    page.drawImage(embeddedImage, {
      x: margin,
      y: margin,
      width: pageWidth,
      height: pageHeight
    });
    
    return await pdfDoc.save();
  }
}

module.exports = new PDFService();
