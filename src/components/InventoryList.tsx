import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Batch, Product } from '../types/inventory';

interface Props {
  batches: Batch[];
  products: Record<string, Product>;
}

export const InventoryList = ({ batches, products }: Props) => {
  const renderItem = ({ item }: { item: Batch }) => {
    const product = products[item.productId];
    const daysLeft = Math.ceil(
      (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );

    return (
      <View style={styles.listItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.productName}>{product?.name || 'Unknown'}</Text>
          <Text style={styles.batchSub}>Batch: {item.batchNumber || 'N/A'} • Qty: {item.quantity}</Text>
        </View>
        <View style={[styles.badge, daysLeft <= 7 ? styles.badgeCritical : styles.badgeWarning]}>
          <Text style={styles.badgeText}>{daysLeft} Days</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={batches}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: { paddingBottom: 20 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemInfo: {
    flex: 1, 
    marginRight: 12,
  },
  productName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  batchSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, minWidth: 70, alignItems: 'center' },
  badgeCritical: { backgroundColor: '#FEE2E2' },
  badgeWarning: { backgroundColor: '#FFEDD5' },
  badgeText: { fontSize: 12, fontWeight: '700' }
});