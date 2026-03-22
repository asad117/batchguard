const MONTH_MAP: Record<string, string> = {
  'JA': '01', 'FE': '02', 'MR': '03', 'AL': '04', 'MA': '05', 'JN': '06',
  'JL': '07', 'AU': '08', 'SE': '09', 'OC': '10', 'NV': '11', 'DE': '12'
};


export const visionService = {
  processBarcodes: (codes: any[]) => {
    'worklet';
    if (codes && codes.length > 0 && codes[0].value) {
      return codes[0].value;
    }
    return null;
  },

};