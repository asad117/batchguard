import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Product } from '../types/inventory';

interface Props {
  isVisible: boolean;
  scannedProduct: Partial<Product>;
  scannedDate: string;
  onConfirm: (qty: number, batchNum: string) => void;
  onCancel: () => void;
}

export const BatchEntryModal = ({ isVisible, scannedProduct, scannedDate, onConfirm, onCancel }: Props) => {
  const [quantity, setQuantity] = useState('1');
  const [batchNum, setBatchNum] = useState('');

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Confirm Batch Details</Text>
          <Text style={styles.subtitle}>{scannedProduct.name || 'Unknown Product'}</Text>
          
          <View style={styles.infoRow}>
            <Text>Expiry: **{scannedDate}**</Text>
          </View>

          <TextInput 
            style={styles.input} 
            placeholder="Batch Number (Optional)" 
            value={batchNum}
            onChangeText={setBatchNum}
          />

          <View style={styles.qtyContainer}>
            <TouchableOpacity onPress={() => setQuantity(String(Math.max(1, +quantity - 1)))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
            <TextInput 
              style={[styles.input, { width: 60, textAlign: 'center' }]} 
              keyboardType="numeric" 
              value={quantity}
              onChangeText={setQuantity}
            />
            <TouchableOpacity onPress={() => setQuantity(String(+quantity + 1))} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(+quantity, batchNum)} style={styles.confirmBtn}><Text style={{color: 'white'}}>Add to Inventory</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  content: { backgroundColor: 'white', borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  infoRow: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 8, marginBottom: 15 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 20 },
  qtyBtn: { width: 40, height: 40, backgroundColor: '#EEE', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  confirmBtn: { flex: 2, padding: 15, backgroundColor: '#007AFF', borderRadius: 8, alignItems: 'center' }
});