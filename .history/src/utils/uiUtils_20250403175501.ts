import { PublicationType } from '../types';

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'Daily': return 'bg-brand-yellow-300';
    case 'Weekly': return 'bg-green-500';
    case 'Monthly': return 'bg-purple-500';
    case 'Quarterly': return 'bg-orange-500';
    case 'Occasional': return 'bg-gray-500';
    default: return 'bg-gray-300';
  }
}; 