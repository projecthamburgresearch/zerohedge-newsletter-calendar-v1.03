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
    const dateA = 'seriesTitle' in a ? a.date : a.startDate;
    const dateB = 'seriesTitle' in b ? b.date : b.startDate;
    return dateA.localeCompare(dateB);
  });

  // Log the counts to help debug
  console.log('Publications count:', publications.length);
  console.log('Events count:', events.length);
  console.log('Total items count:', allItems.length);

  // Filter items based on visibility settings
  const filteredItems = allItems.filter(item => {
    // Use a more robust check to determine if an item is a publication
    const isPublication = 'seriesTitle' in item && 'source' in item;
    const isEvent = 'id' in item && 'title' in item;

    // Log some samples to help with debugging
    if (Math.random() < 0.1) { // Only log ~10% of items to avoid console spam
      console.log('Item check:', { 
        item,
        isPublication, 
        isEvent,
        showPublications,
        showEvents,
        included: (isPublication && showPublications) || (isEvent && showEvents)
      });
    }
    
    if (isPublication && !showPublications) return false;
    if (isEvent && !showEvents) return false;
    return true;
  });

  console.log('Filtered items count:', filteredItems.length);

  const getItemKey = (item: Publication | Event): string => {
    const isPublication = 'seriesTitle' in item && 'source' in item;
    if (isPublication) {
      return `pub-${(item as Publication).source}-${(item as Publication).seriesTitle}-${(item as Publication).date}`;
    }
    return `event-${(item as Event).id}`;
  };

  const getItemDate = (item: Publication | Event): string => {
    const isPublication = 'seriesTitle' in item && 'source' in item;
    return isPublication ? (item as Publication).date : (item as Event).startDate;
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
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const isPublication = 'seriesTitle' in item && 'source' in item;
              const isEvent = 'id' in item && 'title' in item;
              const itemDate = isPublication ? (item as Publication).date : (item as Event).startDate;
              const formattedDate = formatDate(itemDate);
              
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
                    {item.dayOfWeek}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isPublication ? (item as Publication).source : 'Government'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isPublication ? (item as Publication).seriesTitle : (item as Event).title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isPublication ? (item as Publication).newsletterType : (item as Event).description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isPublication ? 'Publication' : 'Economic Event'}
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