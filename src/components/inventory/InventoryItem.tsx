// src/components/inventory/InventoryItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react'; // Added memo
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  item: any;
  product: any;
  isEditMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

// Move calculation outside or memoize it to prevent logic execution on every render
const getStatusColor = (expiryDate: string) => {
  if (!expiryDate) return '#6B7280';
  const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  if (days <= 7) return '#EF4444'; 
  if (days <= 30) return '#F59E0B';
  return '#10B981';
};

const InventoryItem = memo(({ item, product, isEditMode, isSelected, onPress, onLongPress }: Props) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={[styles.card, isSelected && styles.selectedCard]}
    >
      {isEditMode && (
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"} 
          size={22} 
          color={isSelected ? "#3B82F6" : "#D1D5DB"} 
          style={{ marginRight: 12 }} 
        />
      )}
      <Image 
        source={{ uri: product?.imageUrl || 'https://via.placeholder.com/100' }} 
        style={styles.thumb} 
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.brandTag}>{product?.brand || "Generic"}</Text>
        <Text style={styles.productName} numberOfLines={1}>{product?.name}</Text>
        <Text style={styles.barecode} numberOfLines={1}>{product?.barcode}</Text>
        <View style={styles.expiryRow}>
           <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.expiryDate) }]} />
           <Text style={styles.expiryLabel}>{item.expiryDate}</Text>
        </View>
      </View>
      <View style={styles.qtyContainer}>
        <Text style={styles.qtyText}>x{item.quantity}</Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: Only re-render if these specific things change
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isEditMode === nextProps.isEditMode &&
    prevProps.item.quantity === nextProps.item.quantity &&
    prevProps.item.expiryDate === nextProps.item.expiryDate &&
    prevProps.product?.id === nextProps.product?.id
  );
});

export default InventoryItem;

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 12, borderRadius: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  selectedCard: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  thumb: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#F9FAFB' },
  brandTag: { fontSize: 9, fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase' },
  productName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  barecode: { fontSize: 12, fontWeight: '700', color: '#2a3c62' },
  expiryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  expiryLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  qtyContainer: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 10, minWidth: 40, alignItems: 'center' },
  qtyText: { fontWeight: '800', fontSize: 14 },
});