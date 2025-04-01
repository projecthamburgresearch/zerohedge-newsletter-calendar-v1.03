import { Publication } from '@/types';

interface PublicationStats {
  total: number;
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  other: number;
}

export const getPublicationStats = (publications: Publication[]): PublicationStats => {
  const stats: PublicationStats = {
    total: publications.length,
    daily: 0,
    weekly: 0,
    monthly: 0,
    quarterly: 0,
    other: 0
  };

  publications.forEach(pub => {
    switch (pub.newsletterType) {
      case 'Daily':
        stats.daily++;
        break;
      case 'Weekly':
        stats.weekly++;
        break;
      case 'Monthly':
        stats.monthly++;
        break;
      case 'Quarterly':
        stats.quarterly++;
        break;
      default:
        stats.other++;
    }
  });

  return stats;
}; 