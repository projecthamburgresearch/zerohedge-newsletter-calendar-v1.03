import React, { useState } from 'react';
import { Publication, Event } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { getTypeColor } from '@/utils/uiUtils';

interface Props {
  publications: Publication[];
  events: Event[];
  onPublicationClick?: (publication: Publication) => void;
  onEventClick?: (event: Event) => void;
}

/**
 * Renders a list view of publications and events
 */
const ListView: React.FC<Props> = ({
  publications,
  events,
  onPublicationClick,
  onEventClick
}) => {
  const [showPublications, setShowPublications] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  
  // Derived state for UI highlighting
  const showBoth = showPublications && showEvents;

  /**
   * Renders filter controls for reference types
   */
  const renderReferenceTypeFilters = () => (
    <div className="mb-4 flex flex-wrap gap-4 items-center">
      <div className="font-medium text-gray-700">Reference Type:</div>
      <div className="flex gap-2 bg-gray-100 p-1 rounded">
        <button 
          className={`px-4 py-1.5 rounded transition-colors ${showBoth ? 'bg-brand-yellow-300 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          onClick={() => { setShowPublications(true); setShowEvents(true); }}
        >
          All
        </button>
        <button 
          className={`px-4 py-1.5 rounded transition-colors ${showPublications && !showEvents ? 'bg-brand-yellow-300 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          onClick={() => { setShowPublications(true); setShowEvents(false); }}
        >
          Publications
        </button>
        <button 
          className={`px-4 py-1.5 rounded transition-colors ${!showPublications && showEvents ? 'bg-brand-yellow-300 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          onClick={() => { setShowPublications(false); setShowEvents(true); }}
        >
          Events
        </button>
      </div>
    </div>
  );

  const allItems = [...publications, ...events].sort((a, b) => {
    const dateA = 'PublicationTitle' in a ? a.ReleaseDate : ('EventTitle' in b ? b.ReleaseDate : '');
    const dateB = 'PublicationTitle' in b ? b.ReleaseDate : ('EventTitle' in a ? a.ReleaseDate : '');
    return dateA.localeCompare(dateB);
  });

  // Log the counts to help debug
  console.log('Publications count:', publications.length);
  console.log('Events count:', events.length);
  console.log('Total items count:', allItems.length);

  // Filter items based on visibility settings
  const filteredItems = allItems.filter(item => {
    // Use a more robust check to determine if an item is a publication
    const isPublication = item && 'PublicationTitle' in item && item.PublicationTitle;
    const isEvent = item && 'EventTitle' in item && item.EventTitle;
    
    if (isPublication && !showPublications) return false;
    if (isEvent && !showEvents) return false;
    return true;
  });

  console.log('Filtered items count:', filteredItems.length);

  const getItemKey = (item: Publication | Event): string => {
    const isPublication = item && 'PublicationTitle' in item;
    if (isPublication) {
      return `pub-${(item as Publication).InstitutionName || 'unknown'}-${(item as Publication).PublicationTitle || 'untitled'}-${(item as Publication).ReleaseDate || 'nodate'}`;
    }
    return `event-${(item as Event).EventIdentifier || 'unknown'}`;
  };

  return (
    <div className="space-y-4">
      {renderReferenceTypeFilters()}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Institution
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const isPublication = 'PublicationTitle' in item;
              const isEvent = 'EventTitle' in item;
              const formattedDate = formatDate(item.ReleaseDate);
              
              return (
                <tr
                  key={getItemKey(item)}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (isPublication && onPublicationClick) {
                      onPublicationClick(item as Publication);
                    } else if (isEvent && onEventClick) {
                      onEventClick(item as Event);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.DayOfWeek}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isPublication ? (item as Publication).InstitutionName : (item as Event).CountryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isPublication ? (item as Publication).PublicationTitle : (item as Event).EventTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.FrequencyRelease}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView; 