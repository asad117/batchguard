import BatchDetailModal from '@/src/components/inventory/BatchDetailModal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HealthScoreCard from '../../src/components/dashboard/HealthScoreCard';
import RecentActivityList from '../../src/components/dashboard/RecentActivityList';
import StatsGrid from '../../src/components/dashboard/StatsGrid';
import { useInventoryStore } from '../../src/store/useInventoryStore';


export default function DashboardScreen() {
  const { batches, products } = useInventoryStore();
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [showToast, setShowToast] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  // Health & Metric Calculations
  console.log("selectedBatchselectedBatch",selectedBatch)
  const stats = useMemo(() => {
    const now = new Date();
    let critical = 0, warning = 0;

    batches.forEach(b => {
      const days = Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (days <= 7) critical++;
      else if (days <= 30) warning++;
    });

    const health = batches.length > 0 ? Math.round(((batches.length - (critical + warning)) / batches.length) * 100) : 100;
    return { critical, warning, total: batches.length, health };
  }, [batches]);

  // Toast logic
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
          <View style={styles.topActions}>
            {/* <TouchableOpacity style={styles.demoBtn} onPress={() => {
              const { products: p, batches: b } = generateMockData();
              useInventoryStore.setState({ products: p.reduce((acc, x) => ({ ...acc, [x.barcode]: x }), {}), batches: b });
            }}>
              <Text style={styles.demoText}>Demo Data</Text>
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* WIDGETS */}
        <HealthScoreCard score={stats.health} criticalCount={stats.critical} />
        <StatsGrid total={stats.total} critical={stats.critical} warning={stats.warning} />
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
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  brandName: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1.5 },
  screenTitle: { fontSize: 32, fontWeight: '900', color: '#111827' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  demoBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  demoText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
  toast: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#111827', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, elevation: 10 },
  toastText: { color: 'white', fontWeight: '700', fontSize: 14 }
});