import { Batch } from '../types/inventory';

export const getExpiryStats = (batches: Batch[]) => {
  const now = new Date();
  
  return batches.reduce((acc, batch) => {
    const daysLeft = Math.ceil((new Date(batch.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) acc.expired++;
    else if (daysLeft <= 7) acc.critical++;
    else if (daysLeft <= 30) acc.warning++;
    else acc.healthy++;
    
    return acc;
  }, { critical: 0, warning: 0, healthy: 0, expired: 0 });
};