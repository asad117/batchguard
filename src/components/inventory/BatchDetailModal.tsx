import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  batch: any;
  product: any;
  onClose: () => void;
}

export default function BatchDetailModal({ batch, product, onClose }: Props) {
  if (!batch) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!batch}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          {/* HANDLE BAR */}
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>{product?.brand || 'Generic'}</Text>
              <Text style={styles.name}>{product?.name || 'Unknown Product'}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={30} color="#E5E7EB" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Quantity</Text>
                <Text style={styles.infoValue}>{batch.quantity} Units</Text>
              </View>
              <View style={[styles.infoBox, { borderLeftWidth: 1, borderColor: '#F3F4F6' }]}>
                <Text style={styles.infoLabel}>Expiry Date</Text>
                <Text style={[styles.infoValue, { color: '#EF4444' }]}>{batch.expiryDate}</Text>
              </View>
            </View>

            <View style={styles.metaSection}>
              <Text style={styles.metaLabel}>System Info</Text>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                <Text style={styles.metaText}>Added on: {new Date(batch.id).toLocaleDateString()}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="barcode-outline" size={16} color="#9CA3AF" />
                <Text style={styles.metaText}>Barcode: {batch.barcode}</Text>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.duplicateBtn}>
                <Ionicons name="copy-outline" size={20} color="#3B82F6" />
                <Text style={styles.duplicateText}>Duplicate Batch</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={styles.deleteText}>Dispose Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, paddingBottom: 40 },
  handle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  brand: { fontSize: 12, fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase' },
  name: { fontSize: 24, fontWeight: '900', color: '#111827', marginTop: 4 },
  
  content: { gap: 20 },
  infoRow: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 20, padding: 15 },
  infoBox: { flex: 1, paddingHorizontal: 10 },
  infoLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 4 },
  
  metaSection: { paddingHorizontal: 5 },
  metaLabel: { fontSize: 12, fontWeight: '800', color: '#D1D5DB', textTransform: 'uppercase', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  metaText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  actionGrid: { flexDirection: 'row', gap: 12, marginTop: 10 },
  duplicateBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWith: 1, borderColor: '#3B82F6', borderWidth: 1, padding: 18, borderRadius: 20 },
  duplicateText: { color: '#3B82F6', fontWeight: '800', fontSize: 15 },
  deleteBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', padding: 18, borderRadius: 20 },
  deleteText: { color: '#EF4444', fontWeight: '800', fontSize: 14 }
});