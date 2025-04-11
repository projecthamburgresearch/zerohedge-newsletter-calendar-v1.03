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
 * ListView component for displaying publications and events in a table
 */
const ListView: React.FC<Props> = ({
  publications,
  events,
  onPublicationClick,
  onEventClick
}) => {
  const [showPublications, setShowPublications] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  // Combine publications and events for display
  const allItems = [
    ...(showPublications ? publications.map(pub => ({ ...pub, type: 'publication' as const })) : []),
    ...(showEvents ? events.map(event => ({ ...event, type: 'event' as const })) : [])
  ].sort((a, b) => {
    const dateA = a.type === 'publication' ? (a as Publication).ReleaseDate : (a as Event).ReleaseDate;
    const dateB = b.type === 'publication' ? (b as Publication).ReleaseDate : (b as Event).ReleaseDate;
    return dateA.localeCompare(dateB);
  });

  console.log('Total items count:', allItems.length);

  // Filter items based on visibility settings
  const filteredItems = allItems.filter(item => {
    // Use a more robust check to determine if an item is a publication
    const isPublication = 'PublicationTitle' in item && 'InstitutionName' in item;
    const isEvent = 'EventIdentifier' in item && 'EventTitle' in item;

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
    const isPublication = 'PublicationTitle' in item && 'InstitutionName' in item;
    if (isPublication) {
      return `pub-${(item as Publication).InstitutionName}-${(item as Publication).PublicationTitle}-${(item as Publication).ReleaseDate}`;
    }
    return `event-${(item as Event).EventIdentifier}`;
  };

  const getItemDate = (item: Publication | Event): string => {
    const isPublication = 'PublicationTitle' in item && 'InstitutionName' in item;
    return isPublication ? (item as Publication).ReleaseDate : (item as Event).ReleaseDate;
  };

  return (
    <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <div className="px-4 py-2 flex justify-end space-x-2">
        <button
          className={`px-3 py-1 text-sm rounded-md ${showPublications ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
          onClick={() => setShowPublications(!showPublications)}
        >
          {showPublications ? '✓ Publications' : '◯ Publications'}
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-md ${showEvents ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}
          onClick={() => setShowEvents(!showEvents)}
        >
          {showEvents ? '✓ Events' : '◯ Events'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const isPublication = 'PublicationTitle' in item && 'InstitutionName' in item;
              const isEvent = 'EventIdentifier' in item && 'EventTitle' in item;
              const itemDate = isPublication ? (item as Publication).ReleaseDate : (item as Event).ReleaseDate;
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
                    {item.DayOfWeek}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isPublication ? (item as Publication).InstitutionName : (item as Event).CountryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isPublication ? (item as Publication).PublicationTitle : (item as Event).EventTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isPublication ? (item as Publication).FrequencyRelease : (item as Event).EventDescription}
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