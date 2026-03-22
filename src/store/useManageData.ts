// src/store/useManageData.ts

const GOOGLE_SCRIPT_URL = process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL;

/**
 * UPLOAD: Sends local data to Google Sheets
 */
export const syncToCloud = async (data: { batches: any[]; products: any[] }) => {
  try {
    const bodyPayload = JSON.stringify({
      batches: data.batches,
      products: data.products
    });

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: bodyPayload,
      redirect: 'follow'
    });

    if (response.ok) {
      const result = await response.text();
      console.log("Upload Status:", result);
      return result.includes("Sync Successful");
    }
    return false;
  } catch (error) {
    console.error("Upload Error:", error);
    return false;
  }
};




/**
 * DOWNLOAD: Fetches data from Google Sheets
 */
export const fetchFromCloud = async () => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Important for Google Scripts
      redirect: 'follow' 
    });

    if (!response.ok) {
      console.error("Network response status:", response.status);
      return null;
    }
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      
      if (data.error) {
        console.error("Script Error:", data.error);
        return null;
      }
      
      console.log("Download successful. Batches found:", data.batches?.length);
      return data; 
    } catch (parseError) {
      console.error("JSON Parse Error. Raw response:", text);
      return null;
    }
  } catch (error) {
    console.error("Critical Download Error:", error);
    return null;
  }
};