/**
 * src/types/inventory.ts
 * Core data models for Product and Batch management.
 */

export type FilterType = 'all' | 'critical' | 'warning' | 'expired';

export type SortOption = 'expiry_asc' | 'expiry_desc' | 'qty_desc' | 'name_asc';

export interface Product {
  id: string;          // The Barcode/GTIN
  name: string;
  brand: string;
  imageUrl?: string;
  category?: string;
  barcode:number

}

export interface Batch {
  id: string;
  productId: string;   
  batchNumber: string; 
  expiryDate: string;  
  quantity: number;
  entryDate: string;   
  status: 'active' | 'expired' | 'removed';
  notificationId?: string; // Add this line
  barcode:number


}

export interface ScannedResult {
  barcode: number | null;
  expiryDate: string | null;
  rawText?: string;
}