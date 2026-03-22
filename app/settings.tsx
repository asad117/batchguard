import React, { useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';

import { CloudSyncSection } from '../src/components/CloudSyncSection';
import { useInventoryStore } from '../src/store/useInventoryStore';

export default function SettingsScreen() {
  const { preferences, updatePreferences, batches, products } =
    useInventoryStore();

  const handleAction = useCallback(
    async (type: 'light' | 'medium') => {
      try {
        await Haptics.impactAsync(
          type === 'light'
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Medium
        );
      } catch (error) {
        console.error("Haptics error", error);
      }
    },
    []
  );

  const exportInventory = useCallback(async () => {
    await handleAction('medium');
    if (!batches.length) {
      Alert.alert('Empty Inventory', 'Nothing to export yet.');
      return;
    }
    try {
      const header = 'Product,Brand,Quantity,Expiry Date\n';
      const rows = batches
        .map((batch) => {
          const product = products[batch.barcode];
          const safe = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
          return `${safe(product?.name || 'Unknown')},${safe(product?.brand || 'N/A')},${batch.quantity},${batch.expiryDate}`;
        })
        .join('\n');
      const csvContent = header + rows;
      const fileName = `BatchGuard_Data_${Date.now()}.csv`;
      const file = new FileSystem.File(FileSystem.Paths.document, fileName);
      await file.write(csvContent);
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing Unavailable', 'This device does not support file sharing.');
        return;
      }
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export Inventory' });
    } catch (error) {
      console.error('Export Error:', error);
      Alert.alert('Export Error', 'Failed to save or share the CSV file.');
    }
  }, [batches, products, handleAction]);



  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.header}>Settings</Text>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.labelGroup}>
            <Ionicons name="notifications-outline" size={20} color="#4B5563" />
            <Text style={styles.label}>Expiry Alerts</Text>
          </View>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={(val) => {
              handleAction('light');
              updatePreferences({ notificationsEnabled: val });
            }}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          />
        </View>
        <View style={styles.dividerRow}>
          <View style={styles.labelGroup}>
            <Ionicons name="trending-down-outline" size={20} color="#4B5563" />
            <Text style={styles.label}>Health Score Warnings</Text>
          </View>
          <Switch
            value={preferences.healthWarningsEnabled ?? true}
            onValueChange={(val) => {
              handleAction('light');
              updatePreferences({ healthWarningsEnabled: val });
            }}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Alert Lead Time</Text>
      <View style={styles.daysGrid}>
        {[1, 3, 7, 14].map((d) => {
          const active = preferences.daysBeforeExpiry === d;
          return (
            <TouchableOpacity
              key={d}
              style={[styles.dayButton, active && styles.activeDay]}
              onPress={() => {
                handleAction('light');
                updatePreferences({ daysBeforeExpiry: d });
              }}
            >
              <Text style={[styles.dayText, active && styles.activeDayText]}>
                {d} {d === 1 ? 'Day' : 'Days'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>System & Data</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={exportInventory}>
          <View style={styles.labelGroup}>
            <Ionicons name="cloud-download-outline" size={20} color="#3B82F6" />
            <Text style={[styles.label, styles.primaryText]}>Export Inventory (CSV)</Text>
          </View>
          <Ionicons name="share-outline" size={18} color="#3B82F6" />
        </TouchableOpacity>

      
      </View>
      <View style={styles.card}>
          {/* CLOUD SYNC SECTION .. */}
        <CloudSyncSection onAction={handleAction} />
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 24, paddingTop: 60 },
  header: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 30 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 30, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dividerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20 },
  labelGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { fontSize: 16, fontWeight: '700', color: '#374151' },
  primaryText: { color: '#3B82F6' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  dayButton: { flex: 1, minWidth: '45%', backgroundColor: 'white', padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  activeDay: { backgroundColor: '#111827', borderColor: '#111827' },
  dayText: { fontWeight: '700', color: '#4B5563' },
  activeDayText: { color: 'white' },
});