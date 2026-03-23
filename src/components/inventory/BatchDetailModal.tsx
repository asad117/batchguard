// src/components/inventory/BatchDetailModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Print from 'expo-print';
import { getCommercialStatus } from '../../utils/commercialLogic';
import { useInventoryStore } from '../../store/useInventoryStore';

interface Props {
  batch: any;
  product: any;
  onClose: () => void;
}

export default function BatchDetailModal({ batch, product, onClose }: Props) {

  const preferences = useInventoryStore((state) => state.preferences);
  const status = getCommercialStatus(batch?.expiryDate, preferences.daysBeforeExpiry);


  const handlePrint = async () => {
    const html = `
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h1 style="font-size: 50px; margin: 0;">${status.discount}% OFF</h1>
          <h2 style="margin: 10px 0;">${product?.name}</h2>
          <p style="font-size: 20px;">Exp: ${batch.expiryDate}</p>
          <div style="margin-top: 20px; font-weight: bold; border: 2px solid black; padding: 10px;">
            BARCODE: ${batch.barcode}
          </div>
        </body>
      </html>
    `;
    
    // Prints one label for every unit in stock
    for (let i = 0; i < batch.quantity; i++) {
      await Print.printAsync({ html });
    }
  };

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

                  {status.discount > 0 && (
              <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
                <Ionicons name="print-outline" size={20} color="white" />
                <Text style={styles.printText}>Print ${batch.quantity} Labels</Text>
              </TouchableOpacity>
            )}

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
  deleteText: { color: '#EF4444', fontWeight: '800', fontSize: 14 },

   printBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    backgroundColor: '#10B981', 
    padding: 18, 
    borderRadius: 20,
    marginBottom: 10 
  },
  printText: { color: 'white', fontWeight: '800', fontSize: 15 },
  actionGrid: { 
  flexDirection: 'column', 
  gap: 10, 
  marginTop: 10 
},
});