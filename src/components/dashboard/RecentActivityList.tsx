import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecentActivityList({ batches, products,onSelect }: any) {
  const recent = batches.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>Recent Scans</Text>
        <TouchableOpacity onPress={() => router.push('/inventory-list')}>
          <Text style={styles.actionText}>View All</Text>
        </TouchableOpacity>
      </View> */}

      {recent.length === 0 ? (
        <Text style={styles.empty}>No recent activity.</Text>
      ) : (
        recent.map((batch: any) => {
          const product = products[batch.barcode];
          return (
        <TouchableOpacity onPress={() => onSelect(batch)}>

            <View key={batch.id} style={styles.item}>
              <View style={styles.imgContainer}>
                {product?.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.img} />
                ) : (
                  <View style={styles.placeholder} />
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{product?.name || "Unknown"}</Text>
                <Text style={styles.date}>Exp: {batch.expiryDate}</Text>
              </View>
              <View style={styles.qtyPill}>
                <Text style={styles.qtyText}>x{batch.quantity}</Text>
              </View>
            </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 ,padding:20},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  actionText: { fontSize: 14, fontWeight: '700', color: '#3B82F6' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  imgContainer: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F9FAFB', overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, backgroundColor: '#E5E7EB' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  date: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  qtyPill: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qtyText: { fontSize: 12, fontWeight: '800', color: '#10B981' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 10 }
});