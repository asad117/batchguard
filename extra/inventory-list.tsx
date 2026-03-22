import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BatchEditModal from '../src/components/inventory/BatchEditModal';
import InventoryItem from '../src/components/inventory/InventoryItem';
import { useInventoryStore } from '../src/store/useInventoryStore';

type FilterType = 'all' | 'critical' | 'warning';
type SortOption = 'expiry_asc' | 'expiry_desc' | 'qty_desc' | 'name_asc';

export default function InventoryListScreen() {
  const { batches, products, removeBatch, updateBatch } = useInventoryStore();

  // UI & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // NEW
  const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false); // NEW
  const [sortBy, setSortBy] = useState<SortOption>('expiry_asc');

  // Selection & Modal State
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeBatch, setActiveBatch] = useState<any>(null);

  // 1. Get unique brands for the multi-select modal
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    Object.values(products).forEach(p => { if (p.brand) brands.add(p.brand); });
    return Array.from(brands).sort();
  }, [products]);

  // 2. Get unique categories for the multi-select modal
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    Object.values(products).forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats).sort();
  }, [products]);

  // 3. Comprehensive Filtering + Sorting Logic
  const filteredData = useMemo(() => {
    let result = batches.filter(batch => {
      const product = products[batch.barcode];
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch =
        product?.name.toLowerCase().includes(searchLower) ||
        product?.brand.toLowerCase().includes(searchLower);

      const matchesBrand = selectedBrands.length > 0
        ? selectedBrands.includes(product?.brand || "")
        : true;

      const matchesCategory = selectedCategories.length > 0
        ? selectedCategories.includes(product?.category || "")
        : true;

      const daysLeft = Math.ceil(
        (new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );

      let matchesStatus = true;
      if (statusFilter === 'critical') matchesStatus = daysLeft <= 7;
      if (statusFilter === 'warning') matchesStatus = daysLeft <= 30;

      return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
    });

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

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    Alert.alert("Bulk Delete", `Remove ${selectedIds.size} items?`, [
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

  const handleDuplicate = (item: any) => {
    const newBatch = {
      ...item,
      id: Date.now().toString(),
      quantity: 1,
    };
    setActiveBatch(newBatch);
  };

  const handleLongPress = (item: any) => {
    if (isEditMode) return;
    Alert.alert(
      "Quick Actions",
      `${products[item.barcode]?.name}`,
      [
        { text: "Edit Current Batch", onPress: () => setActiveBatch(item) },
        { text: "Add New Batch (Duplicate)", onPress: () => handleDuplicate(item) },
        {
          text: "Delete Item",
          style: "destructive",
          onPress: () => {
            Alert.alert("Confirm Delete", "Remove this batch?", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => removeBatch(item.id) }
            ]);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <Text style={styles.headerSub}>{filteredData.length} items</Text>
        </View>
        <TouchableOpacity
          onPress={() => { setIsEditMode(!isEditMode); setSelectedIds(new Set()); }}
          style={[styles.editBtn, isEditMode && styles.activeEditBtn]}
        >
          <Text style={[styles.editBtnText, isEditMode && { color: 'white' }]}>{isEditMode ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH & SORT BAR */}
      <View style={styles.topControls}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.sortToggle} onPress={() => {
          const options: SortOption[] = ['expiry_asc', 'expiry_desc', 'qty_desc', 'name_asc'];
          setSortBy(options[(options.indexOf(sortBy) + 1) % options.length]);
        }}>
          <Ionicons name="swap-vertical" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* FILTER CHIPS */}
      {!isEditMode && (
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {/* BRAND SELECTOR */}
            <TouchableOpacity
              style={[styles.filterSelector, selectedBrands.length > 0 && styles.activeFilterSelector]}
              onPress={() => setIsBrandModalVisible(true)}
            >
              <Ionicons name="business" size={14} color={selectedBrands.length > 0 ? "white" : "#4B5563"} />
              <Text style={[styles.filterSelectorText, selectedBrands.length > 0 && { color: 'white' }]}>
                {selectedBrands.length === 0 ? "Brands" : `${selectedBrands.length} Brands`}
              </Text>
            </TouchableOpacity>

            {/* CATEGORY SELECTOR */}
            <TouchableOpacity
              style={[styles.filterSelector, selectedCategories.length > 0 && styles.activeFilterSelector]}
              onPress={() => setIsCategoryModalVisible(true)}
            >
              <Ionicons name="grid" size={14} color={selectedCategories.length > 0 ? "white" : "#4B5563"} />
              <Text style={[styles.filterSelectorText, selectedCategories.length > 0 && { color: 'white' }]}>
                {selectedCategories.length === 0 ? "Categories" : `${selectedCategories.length} Categories`}
              </Text>
            </TouchableOpacity>

            {(['all', 'critical', 'warning'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.statusChip, statusFilter === f && styles.activeStatusChip]}
                onPress={() => setStatusFilter(f)}
              >
                <Text style={[styles.statusChipText, statusFilter === f && { color: 'white' }]}>{f.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        renderItem={({ item }) => (
          <InventoryItem
            item={item}
            product={products[item.barcode]}
            isEditMode={isEditMode}
            isSelected={selectedIds.has(item.id)}
            onPress={() => isEditMode ? toggleSelect(item.id) : setActiveBatch(item)}
            onLongPress={() => handleLongPress(item)}
          />
        )}
      />

      {/* BRAND MULTI-SELECT MODAL */}
      <Modal visible={isBrandModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Brands</Text>
              <TouchableOpacity onPress={() => setIsBrandModalVisible(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {availableBrands.map(brand => (
                <TouchableOpacity key={brand} style={styles.brandOption} onPress={() => {
                  setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
                }}>
                  <Text style={styles.brandOptionText}>{brand}</Text>
                  {selectedBrands.includes(brand) && <Ionicons name="checkmark" size={20} color="#3B82F6" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setIsBrandModalVisible(false)}>
              <Text style={styles.applyBtnText}>Apply Brands</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CATEGORY MULTI-SELECT MODAL */}
      <Modal visible={isCategoryModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Categories</Text>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {availableCategories.map(cat => (
                <TouchableOpacity key={cat} style={styles.brandOption} onPress={() => {
                  setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                }}>
                  <Text style={styles.brandOptionText}>{cat || "Uncategorized"}</Text>
                  {selectedCategories.includes(cat) && <Ionicons name="checkmark" size={20} color="#3B82F6" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setIsCategoryModalVisible(false)}>
              <Text style={styles.applyBtnText}>Apply Categories</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BatchEditModal
        batch={activeBatch}
        product={activeBatch ? products[activeBatch.barcode] : null}
        onClose={() => setActiveBatch(null)}
        onSave={(updates) => {
          const exists = batches.some(b => b.id === activeBatch.id);
          if (exists) {
            updateBatch(activeBatch.id, updates);
          } else {
            useInventoryStore.getState().addBatch({ ...activeBatch, ...updates });
          }
          setActiveBatch(null);
        }}
        onDelete={(id) => {
          removeBatch(id);
          setActiveBatch(null);
        }}
      />

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
  topControls: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 15, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', height: 45 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  sortToggle: { width: 45, height: 45, backgroundColor: 'white', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  filterBar: { marginTop: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  filterSelector: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  activeFilterSelector: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterSelectorText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  statusChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  activeStatusChip: { backgroundColor: '#111827' },
  statusChipText: { fontSize: 10, fontWeight: '800', color: '#6B7280' },
  listContent: { padding: 16, paddingBottom: 100 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  brandOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  brandOptionText: { fontSize: 15, fontWeight: '600' },
  applyBtn: { backgroundColor: '#111827', padding: 15, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  applyBtnText: { color: 'white', fontWeight: '700' },
  deleteFab: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, elevation: 5 },
  deleteFabText: { color: 'white', fontWeight: '800', marginLeft: 8 }
});