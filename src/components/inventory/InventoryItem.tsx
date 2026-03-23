import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useInventoryStore } from '../../store/useInventoryStore';
import { getCommercialStatus } from '../../utils/commercialLogic';
import { StatusBadge } from '../common/StatusBadge';

interface Props {
  item: any;
  product: any;
  isEditMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const InventoryItem = memo(({ item, product, isEditMode, isSelected, onPress, onLongPress }: Props) => {
  // Grab user preference for warning days from the store
  const daysBeforeExpiry = useInventoryStore((state) => state.preferences.daysBeforeExpiry);
  
  // Calculate dynamic status and discount
  const status = getCommercialStatus(item.expiryDate, daysBeforeExpiry);
  

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
        <View style={styles.topRow}>
          <Text style={styles.brandTag}>{product?.brand || "Generic"}</Text>
          
          {/* DISCOUNT BADGE - Only shows if warning/critical */}
          {/* {status.discount > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: status.color }]}>
              <Text style={styles.discountText}>{status.discount}% OFF</Text>
            </View>
          )} */}
        <StatusBadge status={status} />
        </View>

        <Text style={styles.productName} numberOfLines={1}>{product?.name}</Text>
        <Text style={styles.barecode} numberOfLines={1}>{product?.barcode}</Text>
        
           <View style={styles.expiryRow}>
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <Text style={styles.expiryLabel}>{item.expiryDate}</Text>
      </View>
      </View>

      <View style={styles.qtyContainer}>
        <Text style={styles.qtyText}>x{item.quantity}</Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandTag: { fontSize: 9, fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase' },
  discountBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: 'white', fontSize: 10, fontWeight: '900' },
  productName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  barecode: { fontSize: 12, fontWeight: '700', color: '#2a3c62' },
  expiryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  expiryLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  qtyContainer: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 10, minWidth: 40, alignItems: 'center' },
  qtyText: { fontWeight: '800', fontSize: 14 },
});