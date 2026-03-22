import { Batch, Product } from '../types/inventory';

const MOCK_PRODUCTS: Product[] = [
  { id: '12345', name: 'Almond Milk (Unsweetened)', brand: 'Silk', category: 'Dairy' },
  { id: '67890', name: 'Greek Yogurt - Honey', brand: 'Chobani', category: 'Dairy' },
  { id: '11223', name: 'Whole Grain Bread', brand: 'Daves Killer', category: 'Bakery' },
  { id: '44556', name: 'Organic Eggs (Large)', brand: 'Vital Farms', category: 'Grocery' },
];

export const generateMockData = () => {
  const products: Record<string, Product> = {};
  const batches: Batch[] = [];

  MOCK_PRODUCTS.forEach(p => products[p.id] = p);

  for (let i = 0; i < 50; i++) {
    const randomProduct = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
    // Random days offset from today: -5 (expired) to +45 (stable)
    const randomDays = Math.floor(Math.random() * 50) - 5; 
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + randomDays);

    batches.push({
      id: `mock-${i}`,
      productId: randomProduct.id,
      batchNumber: `LOT-${Math.floor(Math.random() * 9000) + 1000}`,
      expiryDate: expiry.toISOString().split('T')[0],
      quantity: Math.floor(Math.random() * 150) + 1,
      entryDate: new Date().toISOString(),
      status: 'active',
    });
  }

  return { products, batches };
};