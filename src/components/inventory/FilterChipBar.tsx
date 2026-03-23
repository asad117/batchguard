import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterType } from '../../types/inventory';

interface Props {
  selectedBrandsCount: number;
  selectedCategoriesCount: number;
  statusFilter: FilterType;
  onBrandPress: () => void;
  onCatPress: () => void;
  onStatusChange: (status: FilterType) => void;
  onClearAll: () => void; // New prop
}

export const FilterChipBar = ({ 
  selectedBrandsCount, 
  selectedCategoriesCount, 
  statusFilter, 
  onBrandPress, 
  onCatPress, 
  onStatusChange,
  onClearAll
}: Props) => {
  const hasActiveFilters = selectedBrandsCount > 0 || selectedCategoriesCount > 0 || statusFilter !== 'all';

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CLEAR ALL BUTTON - Conditional */}
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearBtn} onPress={onClearAll}>
            <Ionicons name="refresh-circle" size={18} color="#EF4444" />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.chip, selectedBrandsCount > 0 && styles.activeChip]}
          onPress={onBrandPress}
        >
          <Ionicons name="business" size={14} color={selectedBrandsCount > 0 ? "white" : "#4B5563"} />
          <Text style={[styles.chipText, selectedBrandsCount > 0 && styles.activeText]}>
            {selectedBrandsCount === 0 ? "Brands" : `${selectedBrandsCount} Brands`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, selectedCategoriesCount > 0 && styles.activeChip]}
          onPress={onCatPress}
        >
          <Ionicons name="grid" size={14} color={selectedCategoriesCount > 0 ? "white" : "#4B5563"} />
          <Text style={[styles.chipText, selectedCategoriesCount > 0 && styles.activeText]}>
            {selectedCategoriesCount === 0 ? "Categories" : `${selectedCategoriesCount} Categories`}
          </Text>
        </TouchableOpacity>

        <View style={styles.vDivider} />

        {(['all', 'critical', 'warning', 'expired'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.statusChip, statusFilter === f && styles.activeStatusChip]}
            onPress={() => onStatusChange(f)}
          >
            <Text style={[styles.statusText, statusFilter === f && styles.activeText]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 12, paddingBottom: 5 },
  scrollContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  statusChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  activeChip: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  activeStatusChip: { backgroundColor: '#111827' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  statusText: { fontSize: 10, fontWeight: '800', color: '#6B7280' },
  activeText: { color: 'white' },
  vDivider: { width: 1, height: 20, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  // Clear Button Styles
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 8, borderRightWidth: 1, borderRightColor: '#E5E7EB', marginRight: 4 },
  clearText: { fontSize: 11, fontWeight: '800', color: '#EF4444', textTransform: 'uppercase' }
});