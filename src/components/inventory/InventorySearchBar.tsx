import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SortOption } from '../../types/inventory';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onScanPress: () => void;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

export const InventorySearchBar = ({ value, onChange, onScanPress, sortBy, onSortChange }: Props) => {
  const handleSortToggle = () => {
    const options: SortOption[] = ['expiry_asc', 'expiry_desc', 'qty_desc', 'name_asc'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    onSortChange(options[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name or barcode..."
          value={value}
          onChangeText={onChange}
          placeholderTextColor="#9CA3AF"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
        <View style={styles.divider} />
        <TouchableOpacity onPress={onScanPress} style={styles.iconBtn}>
          <Ionicons name="barcode-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.sortBtn} onPress={handleSortToggle}>
        <Ionicons name="swap-vertical" size={20} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 15, gap: 10 },
  searchBox: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    paddingLeft: 12, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    height: 48 
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#111827', fontWeight: '500' },
  clearBtn: { padding: 4 },
  divider: { width: 1, height: 24, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
  iconBtn: { paddingRight: 8 },
  sortBtn: { 
    width: 48, 
    height: 48, 
    backgroundColor: 'white', 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
});