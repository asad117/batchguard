// src/utils/commercialLogic.ts
export type DiscountStatus = {
  level: 'stable' | 'warning' | 'critical' | 'expired';
  discount: number;
  color: string;
};

export const getCommercialStatus = (expiryDate: string, warningDays: number): DiscountStatus => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize today
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0); // Normalize expiry

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

  // EXPIRED (Red)
  if (diffDays < 0) {
    return { level: 'expired', discount: 0, color: '#EF4444' };
  }
  
  // CRITICAL (Orange-Red: 50% Off) - half of warning period
  if (diffDays <= Math.floor(warningDays / 2)) {
    return { level: 'critical', discount: 50, color: '#F97316' };
  }
  
  // WARNING (Amber: 30% Off)
  if (diffDays <= warningDays) {
    return { level: 'warning', discount: 30, color: '#F59E0B' };
  }

  // STABLE (Green)
  return { level: 'stable', discount: 0, color: '#10B981' };
};