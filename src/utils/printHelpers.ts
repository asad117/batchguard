// src/utils/printHelpers.ts
import * as Print from 'expo-print';

export const printClearanceLabel = async (productName: string, price: string, discount: number, qty: number) => {
  const html = `
    <html>
      <body style="text-align: center; font-family: sans-serif; width: 50mm;">
        <h2 style="margin: 0;">${discount}% OFF</h2>
        <p style="font-size: 18px; margin: 5px 0;">${productName}</p>
        <h1 style="margin: 0;">$${price}</h1>
        <p>Qty: ${qty}</p>
      </body>
    </html>
  `;

  for (let i = 0; i < qty; i++) {
    await Print.printAsync({ html });
  }
};