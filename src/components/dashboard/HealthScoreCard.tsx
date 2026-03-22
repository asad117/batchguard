import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  score: number;
  criticalCount: number;
}

export default function HealthScoreCard({ score, criticalCount }: Props) {
  const getStatusColor = () => (score > 80 ? "#10B981" : score > 50 ? "#F59E0B" : "#EF4444");

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.label}>Inventory Health</Text>
        <Text style={styles.value}>{score}%</Text>
        <Text style={styles.subText}>
          {criticalCount > 0 ? `${criticalCount} items need urgent action` : "All systems stable"}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <View style={[styles.ring, { borderColor: getStatusColor() }]}>
          <Ionicons name="shield-checkmark" size={32} color={getStatusColor()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#111827', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 20, elevation: 4 },
  info: { flex: 1 },
  label: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  value: { color: 'white', fontSize: 44, fontWeight: '900', marginVertical: 4 },
  subText: { color: '#D1D5DB', fontSize: 13, fontWeight: '500' },
  iconContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center' },
  ring: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, justifyContent: 'center', alignItems: 'center' }
});