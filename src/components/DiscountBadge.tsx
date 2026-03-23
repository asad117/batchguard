// src/components/DiscountBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  discount: number;
}

export const DiscountBadge = ({ discount }: Props) => {
  if (discount === 0) return null;

  return (
    <View style={[styles.badge, discount === 50 ? styles.critical : styles.warning]}>
      <Text style={styles.text}>{discount}% OFF</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  warning: { backgroundColor: '#FBBF24' }, // Amber
  critical: { backgroundColor: '#EF4444' }, // Red
  text: { color: 'white', fontSize: 12, fontWeight: '900' },
});