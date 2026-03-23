// src/store/useInventoryStore

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { notificationService } from '../services/notificationService';
import { Batch, Product } from "../types/inventory";

interface UserPreferences {
  daysBeforeExpiry: number;
  notificationsEnabled: boolean;
  healthWarningsEnabled: boolean;
}

interface InventoryState {
  products: Record<string, Product>;
  batches: Batch[];
  preferences: UserPreferences;

  // Actions
  setBatches: (newBatches: Batch[]) => void; // Added for Restore
  setProducts: (newProductsMap: Record<string, Product>) => void; 
  addProduct: (product: Product) => void;
  addBatch: (batch: Batch) => void;
  updateBatch: (batchId: string, updates: Partial<Batch>) => void; 
  updateBatchQuantity: (batchId: string, newQty: number) => void;
  removeBatch: (batchId: string) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: {},
      batches: [],
      preferences: {
        daysBeforeExpiry: 3,
        notificationsEnabled: true,
        healthWarningsEnabled: false,
      },

      /**
       * BULK SETTERS (Used for Cloud Restore)
       */
      setBatches: (newBatches) => set({ batches: newBatches }),
      
      setProducts: (newProductsMap) => set({ products: newProductsMap }),

      /**
       * SINGLE ITEM ACTIONS (Used for Barcode Scanning)
       */
      addProduct: (product) =>
        set((state) => ({
          products: { 
            ...state.products, 
            [String(product.barcode)]: product 
          }
        })),

      addBatch: (newBatch) => set((state) => {
        // Check if a batch with the same barcode AND same expiry already exists
        const existingBatchIndex = state.batches.findIndex(
          (b) => String(b.barcode) === String(newBatch.barcode) && b.expiryDate === newBatch.expiryDate
        );

        if (existingBatchIndex !== -1) {
          // Found it! Map through and update ONLY that quantity
          const updatedBatches = state.batches.map((batch, index) =>
            index === existingBatchIndex
              ? { ...batch, quantity: Number(batch.quantity) + Number(newBatch.quantity) }
              : batch
          );
          return { batches: updatedBatches };
        }

        // Not found? Add it as a new line at the top of the list
        return { batches: [newBatch, ...state.batches] };
      }),

      updateBatch: (batchId, updates) => set((state) => ({
        batches: state.batches.map((b) => (b.id === batchId ? { ...b, ...updates } : b)),
      })),

      updateBatchQuantity: (batchId, newQty) =>
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId ? { ...b, quantity: Math.max(0, newQty) } : b
          ),
        })),

      removeBatch: async (batchId) => {
        const batchToDelete = get().batches.find(b => b.id === batchId);

        if (batchToDelete?.notificationId) {
          await notificationService.cancelNotification(batchToDelete.notificationId);
        }

        set((state) => ({
          batches: state.batches.filter((b) => b.id !== batchId),
        }));
      },

      updatePreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs }
        })),
    }),
    {
      name: 'batchguard-inventory-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);