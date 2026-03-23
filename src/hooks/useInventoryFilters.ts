import { useMemo } from 'react';
import { Batch, Product, SortOption, FilterType } from '../types/inventory';

export function useInventoryFilters(
  batches: Batch[],
  products: Record<string, Product>,
  searchQuery: string,
  statusFilter: FilterType,
  selectedBrands: string[],
  selectedCategories: string[],
  sortBy: SortOption
) {
  return useMemo(() => {
    let result = batches.filter(batch => {
      const product = products[batch.barcode];
      const searchLower = searchQuery.toLowerCase().trim();
      
      // 1. Search Logic
      const matchesSearch =
        product?.name.toLowerCase().includes(searchLower) ||
        product?.brand.toLowerCase().includes(searchLower) ||
        batch.barcode.includes(searchLower);

      // 2. Multi-select Logic
      const matchesBrand = selectedBrands.length > 0
        ? selectedBrands.includes(product?.brand || "")
        : true;

      const matchesCategory = selectedCategories.length > 0
        ? selectedCategories.includes(product?.category || "")
        : true;

      // 3. Commercial Status Logic
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const expiry = new Date(batch.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));

      let matchesStatus = true;
      if (statusFilter === 'expired') matchesStatus = diffDays < 0;
      else if (statusFilter === 'critical') matchesStatus = diffDays >= 0 && diffDays <= 7;
      else if (statusFilter === 'warning') matchesStatus = diffDays >= 0 && diffDays <= 30;

      return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
    });

    // 4. Sorting Logic
    return result.sort((a, b) => {
      const prodA = products[a.barcode];
      const prodB = products[b.barcode];
      if (sortBy === 'expiry_asc') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      if (sortBy === 'expiry_desc') return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
      if (sortBy === 'qty_desc') return b.quantity - a.quantity;
      if (sortBy === 'name_asc') return (prodA?.name || "").localeCompare(prodB?.name || "");
      return 0;
    });
  }, [batches, products, searchQuery, statusFilter, selectedBrands, selectedCategories, sortBy]);
}