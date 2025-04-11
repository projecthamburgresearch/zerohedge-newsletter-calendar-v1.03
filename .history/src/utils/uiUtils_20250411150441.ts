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

export const getEventTypeColor = (type: string): string => {
  switch (type) {
    case 'Market Forecast': return 'bg-blue-100 text-blue-800';
    case 'Central Bank Policy': return 'bg-purple-100 text-purple-800';
    case 'Economic Data': return 'bg-green-100 text-green-800';
    case 'Corporate Earnings': return 'bg-orange-100 text-orange-800';
    default: return 'bg-blue-100 text-blue-800';
  }
}; 