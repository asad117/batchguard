import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { ScanResultModal } from '../../src/components/ScanResultModal';
import { useScanner } from '../../src/hooks/useScanner';

export default function ScannerScreen() {
  const {
    device,
    handleConfirm,
    codeScanner,
    currentStep,
    productInfo,
    isScanning,
    modalVisible,
    resetScanner,
    capture,
    frameProcessor,
    activeBarcode,
    detectedExpiry
  } = useScanner();

  console.log("productInfoproductInfoproductInfo", productInfo)

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing Camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!modalVisible}
        codeScanner={codeScanner}
        frameProcessor={frameProcessor}
        pixelFormat="yuv" 
      />

      <View style={styles.viewfinderContainer}>
        <View style={[
          styles.viewfinder,
          currentStep === 'EXPIRY' && styles.viewfinderExpiry
        ]} />

        {currentStep === 'EXPIRY' && (
          <View style={styles.liveReadBadge}>
            <Text style={styles.liveReadLabel}>DETECTED DATE:</Text>
            <Text style={styles.liveReadValue}>{detectedExpiry || "Searching for Expiry..."}</Text>
          </View>
        )}

        <Text style={styles.viewfinderText}>
          {currentStep === 'BARCODE' ? "Center Barcode" : "Align Expiry Date"}
        </Text>

        {productInfo && (
          <View style={styles.productBubble}>
            <Text style={styles.productBubbleText}>{productInfo.name}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.shutter}
        onPress={capture}
        disabled={isScanning}
      >
        <View style={[
          styles.innerShutter,
          currentStep === 'EXPIRY' && { backgroundColor: '#10B981' },
          isScanning && { opacity: 0.5 }
        ]}>
          {isScanning && <ActivityIndicator color="white" />}
        </View>
      </TouchableOpacity>

      <ScanResultModal
        isVisible={modalVisible}
        productName={productInfo?.name || ""}
        brand={productInfo?.brand || ""} 
        category={productInfo?.category || "Other"} 
        detectedExpiry={detectedExpiry}
        // Updated to accept all 5 arguments from the Modal
        onConfirm={(qty, date, name, brand, category) => {
          handleConfirm(qty, date, name, brand, category); 
        }}
        onCancel={resetScanner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 10, color: '#6B7280', fontWeight: '500' },
  viewfinderContainer: { position: 'absolute', top: '25%', left: 0, right: 0, alignItems: 'center' },
  viewfinder: { width: 280, height: 180, borderWidth: 2, borderColor: '#3B82F6', borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  viewfinderExpiry: { borderColor: '#10B981', height: 100 },
  viewfinderText: { color: 'white', marginTop: 15, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  liveReadBadge: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 10 },
  liveReadLabel: { color: 'white', fontSize: 10, fontWeight: '800', textAlign: 'center' },
  liveReadValue: { color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  productBubble: { marginTop: 20, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  productBubbleText: { color: 'white', fontWeight: '600' },
  shutter: { position: 'absolute', bottom: 50, alignSelf: 'center', width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  innerShutter: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' }
});