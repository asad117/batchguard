import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  total: number;
  critical: number;
  warning: number;
}

export default function StatsGrid({ total, critical, warning }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.box, { backgroundColor: '#F3F4F6' }]}>
        <Text style={styles.num}>{total}</Text>
        <Text style={styles.lab}>Total</Text>
      </View>
      <TouchableOpacity 
        onPress={() => router.push('/inventory-list')}
        style={[styles.box, { backgroundColor: '#FEE2E2' }]}
      >
        <Text style={[styles.num, { color: '#EF4444' }]}>{critical}</Text>
        <Text style={styles.lab}>Critical</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => router.push('/inventory-list')}
        style={[styles.box, { backgroundColor: '#FFEDD5' }]}
      >
        <Text style={[styles.num, { color: '#F59E0B' }]}>{warning}</Text>
        <Text style={styles.lab}>Warning</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12 },
  box: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 22, fontWeight: '800', color: '#111827' },
  lab: { fontSize: 10, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginTop: 2 }
});