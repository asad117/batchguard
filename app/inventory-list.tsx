import React, { useMemo, useState, useCallback } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BatchEditModal from '../src/components/inventory/BatchEditModal';
import InventoryItem from '../src/components/inventory/InventoryItem';
import { InventorySearchBar } from '../src/components/inventory/InventorySearchBar';
import { FilterChipBar } from '../src/components/inventory/FilterChipBar';
import { MultiSelectModal } from '../src/components/common/MultiSelectModal';
import { ScannerOverlay } from '@/src/components/ScannerOverlay';

// State & Logic
import { useInventoryStore } from '../src/store/useInventoryStore';
import { useProductScanner } from '@/src/hooks/useProductScanner';
import { useInventoryFilters } from '../src/hooks/useInventoryFilters';
import { SortOption, FilterType } from '../src/types/inventory';
import { StockHealthSummary } from '@/src/components/inventory/StockHealthSummary';

export default function InventoryListScreen() {

  const { batches, products, preferences,removeBatch, updateBatch, addBatch } = useInventoryStore();
  const { isScanning, setIsScanning, findProductByBarcode } = useProductScanner();

  // Filter & UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('expiry_asc');

  // Modal & Selection State
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [activeBatch, setActiveBatch] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());


  const handleClearFilters = useCallback(() => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setStatusFilter('all');
    setSearchQuery('');
  }, []);

  // Filtered Data via Hook
  const filteredData = useInventoryFilters(
    batches, products, searchQuery, statusFilter,
    selectedBrands, selectedCategories, sortBy
  );

  // Memos for Filter Options
  const availableBrands = useMemo(() =>
    Array.from(new Set(Object.values(products).map(p => p.brand).filter(Boolean))).sort(),
    [products]);

  const availableCategories = useMemo(() =>
    Array.from(new Set(Object.values(products).map(p => p.category).filter(Boolean))).sort(),
    [products]);

  // Handlers
  const handleBarcodeSearch = (barcode: string) => {
    setSearchQuery(barcode);
    setIsScanning(false);
    const result = findProductByBarcode(barcode);
    if (!result.exists) {
      Alert.alert("New Barcode", `Product ${barcode} not found. Add it?`);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    Alert.alert("Confirm", `Delete ${selectedIds.size} items?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: () => {
          selectedIds.forEach(id => removeBatch(id));
          setSelectedIds(new Set());
          setIsEditMode(false);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerSub}>{filteredData.length} active batches</Text>
        </View>
        <TouchableOpacity
          onPress={() => { setIsEditMode(!isEditMode); setSelectedIds(new Set()); }}
          style={[styles.editBtn, isEditMode && styles.activeEditBtn]}
        >
          <Text style={[styles.editBtnText, isEditMode && { color: 'white' }]}>
            {isEditMode ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <InventorySearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onScanPress={() => setIsScanning(true)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {!isEditMode && (
        <FilterChipBar
          selectedBrandsCount={selectedBrands.length}
          selectedCategoriesCount={selectedCategories.length}
          statusFilter={statusFilter}
          onBrandPress={() => setBrandModalVisible(true)}
          onCatPress={() => setCatModalVisible(true)}
          onStatusChange={setStatusFilter}
          onClearAll={handleClearFilters} // Pass the handler here
        />
      )}

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <InventoryItem
            item={item}
            product={products[item.barcode]}
            isEditMode={isEditMode}
            isSelected={selectedIds.has(item.id)}
            onPress={() => isEditMode ? toggleSelect(item.id) : setActiveBatch(item)}
            onLongPress={() => { }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />

      {/* REUSABLE MODALS */}
      <MultiSelectModal
        visible={brandModalVisible}
        title="Filter Brands"
        options={availableBrands}
        selectedValues={selectedBrands}
        onToggle={(val) => setSelectedBrands(prev =>
          prev.includes(val) ? prev.filter(b => b !== val) : [...prev, val]
        )}
        onClose={() => setBrandModalVisible(false)}
      />

      <MultiSelectModal
        visible={catModalVisible}
        title="Filter Categories"
        options={availableCategories}
        selectedValues={selectedCategories}
        onToggle={(val) => setSelectedCategories(prev =>
          prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
        )}
        onClose={() => setCatModalVisible(false)}
      />

      <BatchEditModal
        batch={activeBatch}
        product={activeBatch ? products[activeBatch.barcode] : null}
        onClose={() => setActiveBatch(null)}
        onSave={(updates) => {
          updateBatch(activeBatch.id, updates);
          setActiveBatch(null);
        }}
        onDelete={(id) => {
          removeBatch(id);
          setActiveBatch(null);
        }}
      />
      <ScannerOverlay isVisible={isScanning} onClose={() => setIsScanning(false)} onScan={handleBarcodeSearch} />

      {isEditMode && selectedIds.size > 0 && (
        <TouchableOpacity style={styles.deleteFab} onPress={handleBulkDelete}>
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.deleteFabText}>Delete {selectedIds.size} Items</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { marginTop: 60, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827' },
  headerSub: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  editBtn: { backgroundColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  activeEditBtn: { backgroundColor: '#111827' },
  editBtnText: { fontWeight: '700', color: '#374151' },
  listContent: { padding: 16, paddingBottom: 100 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  deleteFab: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, elevation: 5 },
  deleteFabText: { color: 'white', fontWeight: '800', marginLeft: 8 },
});