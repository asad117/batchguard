// src/components/ScannerOverlay.tsx
import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export const ScannerOverlay = ({ isVisible, onClose, onScan }: Props) => {
  const device = useCameraDevice('back');
  const [isLocked, setIsLocked] = useState(false);

  const codeScanner = useCodeScanner({
    codeTypes: ['code-128', 'ean-13', 'upc-a'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value && !isLocked) {
        setIsLocked(true); // Prevent multiple rapid scans
        onScan(codes[0].value);
        
        // Reset lock after a delay if modal doesn't close
        setTimeout(() => setIsLocked(false), 2000);
      }
    }
  });

  if (!device) return null;

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.container}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isVisible}
          codeScanner={codeScanner}
        />
        
        {/* YOUR VISUAL FEEDBACK LAYER */}
        <View style={styles.overlay}>
          <View style={[styles.targetZone, isLocked && styles.foundZone]}>
             <Ionicons 
                name={isLocked ? "checkmark-circle" : "scan-outline"} 
                size={40} 
                color="white" 
             />
             <Text style={styles.label}>
                {isLocked ? '✅ Barcode Locked' : 'Align Barcode'}
             </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close-circle" size={50} color="white" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  targetZone: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  foundZone: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderStyle: 'solid',
  },
  label: { color: 'white', fontWeight: '800', marginTop: 10, textTransform: 'uppercase' },
  closeBtn: { position: 'absolute', bottom: 50, alignSelf: 'center' }
});