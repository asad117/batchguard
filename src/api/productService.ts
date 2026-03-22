/**
 * src/api/productService.ts
 * Fetches product metadata from Open Food Facts API.
 */

import { Product } from '../types/inventory';

export const fetchProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'BatchGuard/1.0 (asad@example.com)', // API requirement
        },
      }
    );
    const data = await response.json();

    if (data.status === 1) {
      return {
        id: barcode,
        name: data.product.product_name || 'Unknown Product',
        brand: data.product.brands || 'Unknown Brand',
        imageUrl: data.product.image_front_url,
        category: data.product.categories_tags?.[0] || 'Uncategorized',
      };
    }
    return null;
  } catch (error) {
    console.error('Lookup failed:', error);
    return null;
  }
};