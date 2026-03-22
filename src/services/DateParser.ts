
export const parseExpiryDate = (text: string): string | null => {
  // 1. Basic cleanup
  const upperText = text.toUpperCase();
  
  // 2. Regex for common patterns like DD/MM/YYYY or MM/YYYY
  const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
  const match = upperText.match(dateRegex);

  if (match) {
    let [_, day, month, year] = match;
    if (year.length === 2) year = `20${year}`; 
    
    const d = day.padStart(2, '0');
    const m = month.padStart(2, '0');
    
    return `${year}-${m}-${d}`;
  }

  return null;
};