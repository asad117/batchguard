import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useInventoryStore } from '../store/useInventoryStore';
import { fetchFromCloud, syncToCloud } from '../store/useManageData';

export const CloudSyncSection = ({ onAction }: { onAction: (type: 'light' | 'medium') => void }) => {
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const { batches, products, setBatches, setProducts } = useInventoryStore();
  console.log("batches",batches)

  const handleBackup = async () => {
    onAction('medium');
    setLoading(true);
    const success = await syncToCloud({
      batches,
      products: Object.values(products),
    });
    setLoading(false);
    
    if (success) {
      const now = new Date().toLocaleString();
      setLastSynced(now);
      Alert.alert("Success", "Backup saved to Google Sheets");
    } else {
      Alert.alert("Error", "Backup failed. Check connection.");
    }
  };

//   const handleRestore = async () => {
//     onAction('medium');
//     Alert.alert(
//       "Restore Backup?",
//       "This will overwrite all local data with your Google Sheets backup. Proceed?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Yes, Restore", 
//           style: "destructive", 
//           onPress: async () => {
//             setLoading(true);
//             const data = await fetchFromCloud();
//             setLoading(false);
            
//             if (data && data.batches) {
//               const productMap: any = {};
//               data.products.forEach((p: any) => { productMap[p.id] = p; });
              
//               addBatch(data.batches);
//               addProduct(productMap);
              
//               // Set the timestamp from the Cloud metadata
//               if (data.lastSynced) {
//                 setLastSynced(new Date(data.lastSynced).toLocaleString());
//               }
              
//               Alert.alert("Success", "Inventory restored successfully!");
//             } else {
//               Alert.alert("Error", "No backup found or data is null.");
//             }
//           } 
//         }
//       ]
//     );
//   };


const handleRestore = async () => {
  onAction('medium');
  Alert.alert(
    "Restore Backup?",
    "This will overwrite all local data. Proceed?",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Yes, Restore", 
        style: "destructive", 
        onPress: async () => {
          setLoading(true);
          const data = await fetchFromCloud();
          setLoading(false);
          
          if (data && data.batches && data.products) {
            const productMap: any = {};
            
            data.products.forEach((p: any) => {
              const barcodeKey = p.barcode ? String(p.barcode) : null;
              
              if (barcodeKey && barcodeKey !== "undefined") {
                productMap[barcodeKey] = {
                  id: p.id || "",
                  name: p.name || "Unknown",
                  brand: p.brand || "",
                  imageUrl: p.imageUrl || "",
                  category: p.category || "",
                  barcode: p.barcode 
                };
              }
            });

            const rawBatches = Array.isArray(data.batches[0]) ? data.batches[0] : data.batches;
            
            const cleanBatches = rawBatches.map((b: any) => ({
              ...b,
              expiryDate: typeof b.expiryDate === 'string' ? b.expiryDate.split('T')[0] : b.expiryDate,
              barcode: String(b.barcode),
              productId: String(b.productId)
            }));
            
            setBatches(cleanBatches);
            setProducts(productMap);

            if (data.lastSynced) {
              setLastSynced(new Date(data.lastSynced).toLocaleString());
            }
            
            Alert.alert("Success", "Inventory restored with correct structure!");
          } else {
            Alert.alert("Error", "No valid data received from cloud.");
          }
        } 
      }
    ]
  );
};
  return (
    <View style={styles.container}>
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
        <Text style={styles.syncText}>
          Last Cloud Sync: <Text style={styles.dateText}>{lastSynced || "Not yet synced"}</Text>
        </Text>
      </View>

      <View style={styles.syncRow}>
        <TouchableOpacity 
          style={[styles.syncBtn, styles.backupBtn]} 
          onPress={handleBackup} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <><Ionicons name="cloud-upload" size={18} color="#fff" /><Text style={styles.btnText}>Backup</Text></>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.syncBtn, styles.restoreBtn]} 
          onPress={handleRestore} 
          disabled={loading}
        >
          <Ionicons name="cloud-download" size={18} color="#3B82F6" />
          <Text style={[styles.btnText, { color: '#3B82F6' }]}>Restore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  syncText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  dateText: { color: '#6B7280' },
  syncRow: { flexDirection: 'row', gap: 10 },
  syncBtn: { flex: 1, height: 50, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  backupBtn: { backgroundColor: '#111827' },
  restoreBtn: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE' },
  btnText: { fontWeight: '800', fontSize: 14, color: '#fff' }
});