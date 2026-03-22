import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'react-native-get-random-values';
import { useSharedValue } from 'react-native-reanimated';
import { useCameraDevice, useCodeScanner, useFrameProcessor } from 'react-native-vision-camera';
import { useTextRecognition } from 'react-native-vision-camera-text-recognition';
import { v4 as uuidv4 } from 'uuid';

import { ExternalProduct, inventoryApi } from '../api/inventoryApi';
import { normalizeDateWorklet } from "../services/normalizeDateWorklet";
import { notificationService } from '../services/notificationService';
import { visionService } from '../services/visionService';
import { useInventoryStore } from '../store/useInventoryStore';

export const useScanner = () => {
  const device = useCameraDevice('back');
  const { scanText } = useTextRecognition({ language: 'latin' });

  // Refs and State
  const detectedExpiryRef = useRef<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'BARCODE' | 'EXPIRY'>('BARCODE');
  const [activeBarcode, setActiveBarcode] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<ExternalProduct | null>(null);
  const [detectedExpiry, setDetectedExpiry] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Shared Values for Worklets (Performance)
  const stableDate = useSharedValue<string | null>(null);
  const stepSV = useSharedValue<'BARCODE' | 'EXPIRY'>('BARCODE');

  // Sync React State to Worklets
  useEffect(() => { stepSV.value = currentStep; }, [currentStep]);
  useEffect(() => { detectedExpiryRef.current = detectedExpiry; }, [detectedExpiry]);

  // Sync Worklet Result back to React State (Polls every 200ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const foundInWorklet = stableDate.value;
      if (foundInWorklet !== null && foundInWorklet !== detectedExpiryRef.current) {
        setDetectedExpiry(foundInWorklet);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // 1. Barcode Scanner Logic
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'upc-a'],
    onCodeScanned: (codes) => {
      if (currentStep === 'BARCODE') {
        const detected = visionService.processBarcodes(codes);
        if (detected && detected !== activeBarcode) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setActiveBarcode(detected);
        }
      }
    }
  });

  // 2. OCR (Expiry) Logic - Only runs when Step is EXPIRY
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (stepSV.value !== 'EXPIRY' || stableDate.value !== null) return;

    const result = scanText(frame);
    const blocks = result?.blocks || result;
    if (!blocks || blocks.length === 0) return;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (!block) continue;
      const processed = normalizeDateWorklet(`${block.text || ""}`);
      if (processed) {
        stableDate.value = `${processed}`;
        break;
      }
    }
  }, [scanText, stepSV, stableDate]);

  const resetScanner = useCallback(() => {
    setCurrentStep('BARCODE');
    stepSV.value = 'BARCODE';
    setModalVisible(false);
    setProductInfo(null);
    setActiveBarcode(null);
    setDetectedExpiry(null);
    stableDate.value = null;
    detectedExpiryRef.current = null;
  }, []);

  // Transition from Barcode -> Expiry
  const capture = useCallback(async () => {
    if (isScanning) return;

    if (currentStep === 'BARCODE') {
      if (!activeBarcode) return;
      setIsScanning(true);
      try {
        const product = await inventoryApi.fetchProductByBarcode(activeBarcode);
        setProductInfo(product); // API might return null if not found
        setCurrentStep('EXPIRY'); // Move to next step regardless
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.error("Barcode lookup failed:", error);
        setCurrentStep('EXPIRY'); // Allow manual entry even if API fails
      } finally {
        setIsScanning(false);
      }
    } else if (currentStep === 'EXPIRY') {
      setModalVisible(true);
    }
  }, [currentStep, activeBarcode, isScanning]);

  // 3. Final Confirmation & Storage Logic
  const handleConfirm = useCallback(async (
    finalQty: number,
    finalDate: string,
    customName?: string,
    customBrand?: string
  ) => {
    const { addBatch, addProduct, products, preferences } = useInventoryStore.getState();

    // Ensure we use the numerical barcode if possible, or string as fallback
    const rawBarcode = productInfo?.barcode || activeBarcode || "0";
    const finalBarcode = typeof rawBarcode === 'string' ? parseInt(rawBarcode, 10) : rawBarcode;

    const finalName = customName?.trim() || productInfo?.name || `Product ${finalBarcode}`;
    const finalBrand = customBrand?.trim() || productInfo?.brand || "Generic";

    const batchId = uuidv4();

    try {
      if (!products[finalBarcode.toString()]) {
        addProduct({
          id: uuidv4(),
          barcode: finalBarcode,
          name: finalName,
          brand: finalBrand,
          imageUrl: productInfo?.imageUrl || "",
        });
      }

      let scheduledNotificationId = undefined;
      if (preferences.notificationsEnabled) {
        const hasPermission = await notificationService.requestPermissions();
        if (hasPermission) {
          const notifId = await notificationService.scheduleExpiryNotification(
            batchId,
            finalName,
            finalDate,
            preferences.daysBeforeExpiry
          );
          if (notifId) scheduledNotificationId = notifId;
        }
      }

      // UPDATED: Mapping keys to match your Store/Batch interface exactly
      addBatch({
        id: batchId,
        barcode: finalBarcode, // Matches store check
        productId: finalBarcode.toString(),
        batchNumber: "N/A",
        expiryDate: finalDate, // Matches store check
        quantity: finalQty,
        entryDate: new Date().toISOString(),
        status: 'active',
        notificationId: scheduledNotificationId,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setModalVisible(false);
      resetScanner();
    }
  }, [productInfo, activeBarcode, resetScanner]);
  return {
    device,
    codeScanner,
    frameProcessor,
    currentStep,
    productInfo,
    activeBarcode,
    detectedExpiry,
    modalVisible,
    setModalVisible,
    resetScanner,
    capture,
    handleConfirm,
    isScanning
  };
};