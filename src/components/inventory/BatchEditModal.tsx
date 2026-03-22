import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  batch: any;
  product: any;
  onClose: () => void;
  onSave: (updates: { quantity: number; expiryDate: string }) => void;
  onDelete: (id: string) => void;
}

export default function BatchEditModal({ batch, product, onClose, onSave, onDelete }: Props) {
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (batch) {
      setQty(batch.quantity);
      setDate(new Date(batch.expiryDate));
    }
  }, [batch]);

  if (!batch) return null;

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Android closes the picker immediately; iOS stays open
    setShowPicker(Platform.OS === 'ios'); 
    if (selectedDate) setDate(selectedDate);
  };

  // NEW: Delete Confirmation Popup
  const confirmDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to remove this batch of ${product?.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => onDelete(batch.id) 
        }
      ]
    );
  };

  return (
    <Modal visible={!!batch} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlayCenter}>
        <View style={styles.detailCard}>
          <Image source={{ uri: product?.imageUrl }} style={styles.detailImg} />
          <Text style={styles.detailBrand}>{product?.brand || 'Generic'}</Text>
          <Text style={styles.detailName}>{product?.name}</Text>
          <Text style={styles.detailName}>{product?.barcode}</Text>


          <View style={styles.editSection}>
            {/* QUANTITY EDIT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))}>
                  <Ionicons name="remove-circle-outline" size={32} color="#3B82F6" />
                </TouchableOpacity>
                <TextInput 
                  style={styles.qtyInput} 
                  keyboardType="numeric" 
                  value={qty.toString()}
                  onChangeText={(val) => setQty(parseInt(val) || 0)}
                />
                <TouchableOpacity onPress={() => setQty(qty + 1)}>
                  <Ionicons name="add-circle-outline" size={32} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* DATE EDIT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expiry Date</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowPicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.datePickerText}>{date.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={() => onSave({ quantity: qty, expiryDate: date.toISOString().split('T')[0] })}
            >
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
            
            {/* Confirmation Triggered Here */}
            <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  detailCard: { backgroundColor: 'white', borderRadius: 30, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  detailImg: { width: 120, height: 120, borderRadius: 20, marginBottom: 15 },
  detailBrand: { fontSize: 10, fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 1 },
  detailName: { fontSize: 20, fontWeight: '700', textAlign: 'center', color: '#111827', marginBottom: 5 },
  editSection: { width: '100%', marginTop: 20, gap: 15 },
  inputGroup: { width: '100%' },
  label: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8, marginLeft: 5 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 18, justifyContent: 'space-between', borderWidth: 1, borderColor: '#F3F4F6' },
  qtyInput: { fontSize: 22, fontWeight: '900', textAlign: 'center', color: '#111827', width: 60 },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#F3F4F6' },
  datePickerText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  footer: { flexDirection: 'row', gap: 12, marginTop: 25, width: '100%' },
  saveBtn: { flex: 1, backgroundColor: '#111827', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: 'white', fontWeight: '800', fontSize: 16 },
  deleteBtn: { width: 60, backgroundColor: '#FEE2E2', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeBtn: { marginTop: 20 },
  closeBtnText: { color: '#9CA3AF', fontWeight: '700', fontSize: 14 }
});