import React from 'react';
import { Publication } from '@/types';
import { getPublicationStats } from '@/utils/statsUtils';

interface FooterStatsProps {
  publications: Publication[];
}

/**
 * Renders statistics about publications in the footer
 */
export const FooterStats: React.FC<FooterStatsProps> = ({ publications }) => {
  const stats = getPublicationStats(publications);

  return (
    <div className="mt-6 bg-white rounded-lg shadow p-4 flex justify-between items-center">
      <div>
        <span className="text-gray-600">Total Publications:</span>
        <span className="font-bold ml-2">{stats.total}</span>
      </div>
      
      <div className="flex gap-4">
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-brand-yellow-300 mr-1"></span>
          <span className="text-sm">{stats.daily} Daily</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
          <span className="text-sm">{stats.weekly} Weekly</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-purple-500 mr-1"></span>
          <span className="text-sm">{stats.monthly} Monthly</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-orange-500 mr-1"></span>
          <span className="text-sm">{stats.other} Other</span>
        </div>
      </div>
    </div>
  );
}; 