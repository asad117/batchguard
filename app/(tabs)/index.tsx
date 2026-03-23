import BatchDetailModal from '@/src/components/inventory/BatchDetailModal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RecentActivityList from '../../src/components/dashboard/RecentActivityList';
import { StockHealthSummary } from '../../src/components/inventory/StockHealthSummary'; // New Component
import { useInventoryStore } from '../../src/store/useInventoryStore';
import { InventoryAnalytics } from '@/src/components/inventory/InventoryAnalytics';

export default function DashboardScreen() {
  const { batches, products, preferences } = useInventoryStore(); // Added preferences
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [showToast, setShowToast] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  // Toast logic (Triggers when items are added/removed)
  useEffect(() => {
    if (batches.length > 0) {
      setShowToast(true);
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(toastOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => setShowToast(false));
    }
  }, [batches.length]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brandName}>BatchGuard</Text>
            <Text style={styles.screenTitle}>Dashboard</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <StockHealthSummary 
          batches={batches} 
          warningDays={preferences?.daysBeforeExpiry || 30} 
        />

        <InventoryAnalytics batches={batches} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/inventory-list')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <RecentActivityList 
          batches={batches} 
          products={products} 
          onSelect={(batch:any) => setSelectedBatch(batch)} 
        />

      </ScrollView>

      <BatchDetailModal 
        batch={selectedBatch} 
        product={selectedBatch ? products[selectedBatch.barcode] : null}
        onClose={() => setSelectedBatch(null)} 
      />

      {showToast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>✅ Inventory Updated</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingTop: 60, paddingBottom: 100 }, // Removed horizontal padding here so Summary can control its own
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingHorizontal: 20 },
  brandName: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1.5 },
  screenTitle: { fontSize: 32, fontWeight: '900', color: '#111827' },
  settingsBtn: { padding: 8, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 15, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  viewAll: { fontSize: 14, fontWeight: '700', color: '#3B82F6' },
  toast: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#111827', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  toastText: { color: 'white', fontWeight: '700', fontSize: 14 }
});