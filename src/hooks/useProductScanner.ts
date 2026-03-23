// src/hooks/useProductScanner.ts
import { useState } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { Batch, Product } from '../types/inventory';

export const useProductScanner = () => {
  const { batches, products } = useInventoryStore();
  const [isScanning, setIsScanning] = useState(false);

  const findProductByBarcode = (barcode: string) => {
    // 1. Find the product details
    const product = products[barcode];
    
    // 2. Find all batches associated with this barcode
    const associatedBatches = batches.filter(b => b.barcode === barcode);

    return {
      product,
      batches: associatedBatches,
      exists: !!product
    };
  };

  const toggleScanner = () => setIsScanning(!isScanning);

  return {
    isScanning,
    setIsScanning,
    toggleScanner,
    findProductByBarcode,
  };
};