const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v0';

export interface ExternalProduct {
  name: string;
  brand: string;
  imageUrl?: string;
  barcode:number;
}

export const inventoryApi = {
  fetchProductByBarcode: async (barcode: string): Promise<ExternalProduct | null> => {
    try {
      const response = await fetch(`${OFF_API_BASE}/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1) {
        debugger
        return {
          name: data.product.product_name || 'Unknown Product',
          brand: data.product.brands || 'Generic',
          imageUrl: data.product.image_front_small_url,
          barcode:data.product.code,
        };
      }
      return null;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  }
};