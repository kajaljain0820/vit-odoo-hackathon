import { createWorker } from 'tesseract.js';
import path from 'path';

export const scanReceipt = async (filePath: string) => {
  const absolutePath = path.resolve(filePath);
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(absolutePath);
    await worker.terminate();

    // Enhanced logic to find numbers (Amount)
    // 1. Clean the text of common OCR misread symbols
    const cleanText = text.replace(/[^a-zA-Z0-9.\s,:\$€£₹]/g, '');

    // 2. Look for keywords near numbers
    // This regex looks for common amount headers followed by a currency symbol or just a number
    // It captures decimals with either . or , 
    const amountPatterns = [
      /(?:total|grand total|amount|sum|net|due|bill|price|pay|value)\s*[:\s]*[\$£€₹]?\s*(\d+[.,]\d{2})/i,
      /[\$£€₹]\s*(\d+[.,]\d{2})/i,
      /(\d+[.,]\d{2})\s*(?:total|net)/i
    ];

    let suggestedAmount: number | null = null;
    
    for (const pattern of amountPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        // Convert to standard decimal format
        const cleanedStr = match[1].replace(',', '.');
        const parsed = parseFloat(cleanedStr);
        if (!isNaN(parsed) && parsed > 0) {
          suggestedAmount = parsed;
          break;
        }
      }
    }

    // 3. Fallback: find the largest number on the receipt (usually the total)
    if (!suggestedAmount) {
      const allNumbers = cleanText.match(/\d+[.,]\d{2}/g);
      if (allNumbers) {
        const parsedNumbers = allNumbers
          .map(n => parseFloat(n.replace(',', '.')))
          .filter(n => !isNaN(n));
        
        if (parsedNumbers.length > 0) {
          suggestedAmount = Math.max(...parsedNumbers);
        }
      }
    }

    return {
      text,
      suggestedAmount,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    if (worker) await worker.terminate();
    return { text: '', suggestedAmount: null };
  }
};
