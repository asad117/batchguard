import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Batch } from '../../types/inventory';

const { width } = Dimensions.get('window');

interface Props {
  batches: Batch[];
  warningDays: number;
}

export const StockHealthSummary = ({ batches, warningDays }: Props) => {
  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let totalQty = 0;
    let expiredQty = 0;
    let criticalQty = 0;
    let warningQty = 0;

    batches.forEach((batch) => {
      const expiry = new Date(batch.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
      
      const qty = batch.quantity || 0;
      totalQty += qty;

      if (diffDays < 0) expiredQty += qty;
      else if (diffDays <= Math.floor(warningDays / 2)) criticalQty += qty;
      else if (diffDays <= warningDays) warningQty += qty;
    });

    const healthyQty = totalQty - (expiredQty + criticalQty);
    const healthScore = totalQty > 0 ? Math.round((healthyQty / totalQty) * 100) : 100;

    return { totalQty, expiredQty, criticalQty, warningQty, healthScore };
  }, [batches, warningDays]);

  return (
    <View style={styles.container}>
      {/* Main Score Card */}
      <View style={styles.mainCard}>
        <View style={styles.scoreSection}>
          <View style={styles.ringBase}>
             <Text style={styles.scoreNumber}>{stats.healthScore}%</Text>
             <Text style={styles.scoreLabel}>Health</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalQty}</Text>
            <Text style={styles.statName}>Total Stock</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.expiredQty}</Text>
            <Text style={styles.statName}>Expired</Text>
          </View>
        </View>
      </View>

      {/* Quick Action Info Boxes */}
      <View style={styles.row}>
        <View style={[styles.infoBox, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="alert-circle" size={18} color="#EF4444" />
          <View>
            <Text style={styles.infoValue}>{stats.criticalQty}</Text>
            <Text style={styles.infoLabel}>Critical</Text>
          </View>
        </View>
        
        <View style={[styles.infoBox, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="warning" size={18} color="#F59E0B" />
          <View>
            <Text style={styles.infoValue}>{stats.warningQty}</Text>
            <Text style={styles.infoLabel}>Warning</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 15 },
  mainCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreSection: {
    width: 85,
    height: 85,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#10B981', // Healthy Green
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  ringBase: { alignItems: 'center' },
  scoreNumber: { color: 'white', fontSize: 22, fontWeight: '900' },
  scoreLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statsGrid: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: 'white', fontSize: 20, fontWeight: '800' },
  statName: { color: '#9CA3AF', fontSize: 11, fontWeight: '600', marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: '#374151' },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  infoBox: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    padding: 15, 
    borderRadius: 18 
  },
  infoValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#4B5563' },
});