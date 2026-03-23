import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  title: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}

export const MultiSelectModal = ({ visible, title, options, selectedValues, onToggle, onClose }: Props) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.bottomSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} /></TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 300 }}>
          {options.map(option => (
            <TouchableOpacity key={option} style={styles.optionRow} onPress={() => onToggle(option)}>
              <Text style={styles.optionText}>{option || "Uncategorized"}</Text>
              {selectedValues.includes(option) && <Ionicons name="checkmark" size={20} color="#3B82F6" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  optionText: { fontSize: 15, fontWeight: '600' },
  applyBtn: { backgroundColor: '#111827', padding: 15, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  applyBtnText: { color: 'white', fontWeight: '700' },
});