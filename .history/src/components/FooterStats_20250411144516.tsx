import React from 'react';
import { Publication, Event } from '@/types';

interface FooterStatsProps {
  publications: Publication[];
  events: Event[];
}

/**
 * Renders statistics about publications in the footer
 */
export const FooterStats: React.FC<FooterStatsProps> = ({ publications, events }) => {
  // Count publications by frequency
  const pubStats = {
    total: publications.length,
    daily: publications.filter(p => p.FrequencyRelease.toLowerCase() === 'daily').length,
    weekly: publications.filter(p => p.FrequencyRelease.toLowerCase() === 'weekly').length,
    monthly: publications.filter(p => p.FrequencyRelease.toLowerCase() === 'monthly').length,
    other: publications.filter(p => !['daily', 'weekly', 'monthly'].includes(p.FrequencyRelease.toLowerCase())).length,
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex gap-4">
        <div>
          <span className="text-gray-600">Publications:</span>
          <span className="font-bold ml-2">{pubStats.total}</span>
        </div>
        
        <div>
          <span className="text-gray-600">Events:</span>
          <span className="font-bold ml-2">{events.length}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-brand-yellow-300 mr-1"></span>
          <span className="text-sm">{pubStats.daily} Daily</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
          <span className="text-sm">{pubStats.weekly} Weekly</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-purple-500 mr-1"></span>
          <span className="text-sm">{pubStats.monthly} Monthly</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-orange-500 mr-1"></span>
          <span className="text-sm">{pubStats.other} Other</span>
        </div>
      </div>
    </div>
  );
}; 