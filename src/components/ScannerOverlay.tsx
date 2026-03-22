import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const ScannerOverlay = ({ barcodeFound, dateFound }: { barcodeFound: boolean, dateFound: boolean }) => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Top Zone: Barcode */}
      <View style={[styles.targetZone, barcodeFound && styles.foundZone]}>
        <Text style={styles.label}>{barcodeFound ? '✅ Barcode Locked' : 'Align Barcode'}</Text>
      </View>

      {/* Bottom Zone: Expiry Date */}
      <View style={[styles.targetZone, dateFound && styles.foundZone]}>
        <Text style={styles.label}>{dateFound ? '✅ Expiry Detected' : 'Scan Expiry Date'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  targetZone: {
    flex: 1,
    margin: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foundZone: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderStyle: 'solid',
  },
  label: {
    color: 'white',
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    borderRadius: 4,
  }
});