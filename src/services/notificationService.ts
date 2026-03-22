// import * as Notifications from 'expo-notifications';

// // Configure how notifications appear when the app is FOREGROUNDED
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     // Add these two to satisfy the TypeScript interface
//     shouldShowBanner: true, 
//     shouldShowList: true,
//   }),
// });

// export const notificationService = {
//   // Request permissions from the user
//   requestPermissions: async () => {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     return finalStatus === 'granted';
//   },
// // src/services/notificationService.ts

// scheduleExpiryNotification: async (
//   batchId: string, 
//   productName: string, 
//   expiryDate: string,
//   daysBefore: number // New parameter
// ) => {
//   const expiry = new Date(expiryDate);
  
//   const triggerDate = new Date(expiry);
//   triggerDate.setDate(triggerDate.getDate() - daysBefore);
//   triggerDate.setHours(9, 0, 0, 0);

//   if (triggerDate <= new Date()) return null;

//   return await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "⚠️ Expiry Alert",
//       body: `${productName} expires in ${daysBefore} days!`,
//       data: { batchId },
//     },
//     trigger: triggerDate,
//   });
// },

//   cancelNotification: async (id: string) => {
//     await Notifications.cancelScheduledNotificationAsync(id);
//   }
// };




import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Request permissions and setup Android Channels
  requestPermissions: async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

    // Create Android Channel (Essential for Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('expiry-alerts', {
        name: 'Expiry Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  },

scheduleExpiryNotification: async (
  batchId: string,
  productName: string,
  expiryDate: string,
  daysBefore: number
): Promise<string | null> => {

  const triggerDate = new Date(expiryDate);
  triggerDate.setDate(triggerDate.getDate() - daysBefore);
  triggerDate.setHours(9, 0, 0, 0);

  if (triggerDate <= new Date()) {
    console.warn('Notification trigger date is in the past.');
    return null;
  }

  try {
    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Expiry Alert",
          body: `${productName} expires in ${daysBefore} days!`,
          data: { batchId },
          sound: true,
        },

        // ✅ NEW REQUIRED STRUCTURE
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,

          ...(Platform.OS === 'android' && {
            channelId: 'expiry-alerts',
          }),
        },
      });

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
},

  cancelNotification: async (id: string): Promise<void> => {
    if (!id) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      console.error("Cancel notification error:", e);
    }
  }
};