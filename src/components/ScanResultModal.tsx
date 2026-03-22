import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { QuantityStepper } from './ui/QuantityStepper';

const CATEGORIES = [
  "Dairy", "Bakery", "Pantry", "Pharmacy", 
  "Beverages", "Snacks", "Frozen", "Produce", "Other"
];

interface ModalProps {
  isVisible: boolean;
  productName: string;
  brand: string;
  category?: string; 
  detectedExpiry: string | null;
  onConfirm: (finalQty: number, finalDate: string, customName: string, customBrand: string, customCategory: string) => void; 
  onCancel: () => void;
}

export const ScanResultModal = ({ isVisible, productName, brand, category, detectedExpiry, onConfirm, onCancel }: ModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(new Date());
  const [editableName, setEditableName] = useState(""); 
  const [editableBrand, setEditableBrand] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("Other");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false); // Controls dropdown state
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setEditableName(productName || "");
      setEditableBrand(brand || ""); 
      setSelectedCategory(category || "Other");
      setIsCategoryOpen(false);
      const initialDate = detectedExpiry ? new Date(detectedExpiry + "T12:00:00") : new Date();
      setDate(isNaN(initialDate.getTime()) ? new Date() : initialDate);
      setQuantity(1);
    }
  }, [isVisible, productName, brand, category, detectedExpiry]);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      Haptics.selectionAsync();
      setDate(selectedDate);
    }
  };

  const formatDateLabel = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatDateForApi = (d: Date) => d.toISOString().split('T')[0];

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(quantity, formatDateForApi(date), editableName, editableBrand, selectedCategory);
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.headerText}>VERIFY BATCH</Text>
          
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* PRODUCT NAME INPUT */}
            <View style={styles.section}>
              <Text style={styles.label}>PRODUCT NAME</Text>
              <TextInput
                style={styles.nameInput}
                value={editableName}
                onChangeText={setEditableName}
                placeholder="Enter product name..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* BRAND NAME INPUT */}
            <View style={styles.section}>
              <Text style={styles.label}>BRAND</Text>
              <TextInput
                style={[styles.nameInput, styles.brandInput]}
                value={editableBrand}
                onChangeText={setEditableBrand}
                placeholder="e.g. Kirkland, Nestle..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* CATEGORY DROPDOWN */}
            <View style={styles.section}>
              <Text style={styles.label}>CATEGORY</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.dropdownHeader, isCategoryOpen && styles.dropdownHeaderActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsCategoryOpen(!isCategoryOpen);
                }}
              >
                <Text style={styles.dropdownHeaderText}>{selectedCategory}</Text>
                <Ionicons 
                  name={isCategoryOpen ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#6B7280" 
                />
              </TouchableOpacity>

              {isCategoryOpen && (
                <View style={styles.dropdownList}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity 
                      key={cat}
                      style={styles.dropdownItem}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedCategory === cat && styles.dropdownItemTextActive
                      ]}>{cat}</Text>
                      {selectedCategory === cat && (
                        <Ionicons name="checkmark" size={18} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.label}>EXPIRY DATE</Text>
              <TouchableOpacity 
                style={[styles.dateSelector, !detectedExpiry && styles.manualBorder]} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowPicker(true);
                }}
              >
                <View>
                  <Text style={styles.dateValue}>{formatDateLabel(date)}</Text>
                  <Text style={styles.subLabel}>{detectedExpiry ? "Captured via Camera" : "Manual selection"}</Text>
                </View>
                <Text style={styles.editLink}>Change</Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>TOTAL QUANTITY</Text>
              <QuantityStepper value={quantity} onChange={(val) => {
                Haptics.selectionAsync();
                setQuantity(val);
              }} />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Discard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Add to Inventory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 400, maxHeight: '90%', backgroundColor: 'white', borderRadius: 28, padding: 24, elevation: 10 },
  headerText: { fontSize: 12, fontWeight: '900', color: '#10B981', letterSpacing: 1.5, marginBottom: 12 },
  nameInput: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827', 
    backgroundColor: '#F3F4F6', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  brandInput: { fontSize: 14, color: '#4B5563', fontWeight: '600', paddingVertical: 8 },
  section: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginBottom: 8, letterSpacing: 0.5 },
  
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownHeaderActive: { borderColor: '#111827', backgroundColor: '#F9FAFB' },
  dropdownHeaderText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  dropdownList: {
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  dropdownItemTextActive: { color: '#111827', fontWeight: '700' },

  dateSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  manualBorder: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  dateValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  subLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  editLink: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  footer: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 18, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center' },
  confirmBtn: { flex: 2, padding: 18, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center' },
  cancelText: { color: '#4B5563', fontWeight: '700' },
  confirmText: { color: 'white', fontWeight: '700' },
});