// src/utils/inventoryPhysics.ts

export type StatusLevel = 'stable' | 'warning' | 'critical' | 'expired';

export const getBatchStatus = (expiryDate: string, warningDays: number): StatusLevel => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'expired';
  if (diffDays <= Math.floor(warningDays / 2)) return 'critical'; // Bottom half of warning range
  if (diffDays <= warningDays) return 'warning';
  return 'stable';
};

export const getSuggestedDiscount = (status: StatusLevel): number => {
  if (status === 'critical') return 50;
  if (status === 'warning') return 30;
  return 0;
};