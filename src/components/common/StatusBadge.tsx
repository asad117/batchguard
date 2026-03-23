import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiscountStatus } from '../../utils/commercialLogic';

interface Props {
  status: DiscountStatus;
  showIcon?: boolean;
  style?: ViewStyle;
}

export const StatusBadge = ({ status, showIcon = false, style }: Props) => {
  // If the product is stable and has no discount, don't show anything
  if (status.level === 'stable') return null;

  // Determine Label and Icon based on level
  const isExpired = status.level === 'expired';
  const label = isExpired ? 'EXPIRED' : `${status.discount}% OFF`;
  const iconName = isExpired ? 'alert-circle' : 'pricetag';

  return (
    <View style={[styles.badge, { backgroundColor: status.color }, style]}>
      {showIcon && <Ionicons name={iconName} size={12} color="white" style={{ marginRight: 4 }} />}
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  text: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});