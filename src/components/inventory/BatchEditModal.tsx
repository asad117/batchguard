import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView } from 'react-native';
import * as Print from 'expo-print';
import { useInventoryStore } from '../../store/useInventoryStore';
import { getCommercialStatus } from '../../utils/commercialLogic';
import { StatusBadge } from '../common/StatusBadge';

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

  const preferences = useInventoryStore((state) => state.preferences);

  useEffect(() => {
    if (batch) {
      setQty(batch.quantity);
      setDate(new Date(batch.expiryDate));
    }
  }, [batch]);

  if (!batch) return null;

  const status = getCommercialStatus(date.toISOString().split('T')[0], preferences.daysBeforeExpiry);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios'); 
    if (selectedDate) setDate(selectedDate);
  };

  const handlePrint = async () => {
    const barcodeImageUrl = `https://barcode.tec-it.com/barcode.ashx?data=${product?.barcode}&code=Code128&dpi=96`;
    const html = `
      <html>
        <body style="font-family: 'Helvetica', sans-serif; text-align: center; padding: 10px; width: 50mm;">
          <div style="border: 2px solid #000; padding: 10px; border-radius: 10px;">
            <h1 style="font-size: 32px; margin: 0; color: #EF4444;">${status.discount}% OFF</h1>
            <p style="font-size: 14px; font-weight: bold; margin: 5px 0; text-transform: uppercase;">${product?.brand}</p>
            <p style="font-size: 18px; margin: 5px 0;">${product?.name}</p>
            <img src="${barcodeImageUrl}" style="width: 100%; height: auto; margin: 10px 0;" />
            <p style="font-size: 12px; margin: 2px 0;">${product?.barcode}</p>
            <hr style="border: 0; border-top: 1px dashed #CCC;" />
            <p style="font-size: 14px; font-weight: bold; margin: 5px 0;">EXP: ${date.toISOString().split('T')[0]}</p>
          </div>
        </body>
      </html>`;
    
    try {
      for (let i = 0; i < qty; i++) {
        await Print.printAsync({ html });
      }
    } catch (error) {
      Alert.alert("Printer Error", "Could not connect to printer.");
    }
  };

  const confirmDelete = () => {
    Alert.alert("Confirm Deletion", `Remove batch of ${product?.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(batch.id) }
    ]);
  };

  return (
    <Modal visible={!!batch} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.overlayCenter}
      >
        <View style={styles.detailCard}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
          >
            <StatusBadge 
              status={status} 
              showIcon={true} 
              style={{ marginBottom: 15, alignSelf: 'center' }} 
            />
            
            <Image source={{ uri: product?.imageUrl }} style={styles.detailImg} />
            <Text style={styles.detailBrand}>{product?.brand || 'Generic'}</Text>
            <Text style={styles.detailName}>{product?.name}</Text>
            <Text style={styles.detailBarcode}>{product?.barcode}</Text>

            <View style={styles.editSection}>
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

                   {status.discount > 0 && status.level !== 'expired' && (
                <TouchableOpacity style={styles.printFullBtn} onPress={handlePrint}>
                  <Ionicons name="print-outline" size={20} color="white" />
                  <Text style={styles.printText}>Print {qty} Labels</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={() => onSave({ quantity: qty, expiryDate: date.toISOString().split('T')[0] })}
              >
                <Text style={styles.saveText}>Save Changes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  // detailCard: Added maxHeight to ensure it doesn't push the buttons off screen
  detailCard: { 
    backgroundColor: 'white', 
    borderRadius: 30, 
    paddingHorizontal: 10,
    paddingVertical: 20,
    maxHeight: '90%', // Ensures it doesn't exceed screen height
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 20, 
    elevation: 10 
  },
  scrollContent: { alignItems: 'center', paddingHorizontal: 15 },
  detailImg: { width: 120, height: 120, borderRadius: 20, marginBottom: 15 },
  detailBrand: { fontSize: 10, fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 1 },
  detailName: { fontSize: 20, fontWeight: '700', textAlign: 'center', color: '#111827', marginBottom: 5 },
  detailBarcode: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 5 },
  editSection: { width: '100%', marginTop: 20, gap: 15 },
  inputGroup: { width: '100%' },
  label: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8, marginLeft: 5 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 18, justifyContent: 'space-between', borderWidth: 1, borderColor: '#F3F4F6' },
  qtyInput: { fontSize: 22, fontWeight: '900', textAlign: 'center', color: '#111827', width: 60 },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#F3F4F6' },
  datePickerText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  printFullBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#10B981', padding: 15, borderRadius: 18 },
  printText: { color: 'white', fontWeight: '800', fontSize: 14 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 25, width: '100%' },
  saveBtn: { flex: 1, backgroundColor: '#111827', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: 'white', fontWeight: '800', fontSize: 16 },
  deleteBtn: { width: 60, backgroundColor: '#FEE2E2', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeBtn: { marginTop: 20, marginBottom: 10 },
  closeBtnText: { color: '#9CA3AF', fontWeight: '700', fontSize: 14 }
});