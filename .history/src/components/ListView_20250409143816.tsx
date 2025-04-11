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
  const [showEvents, setShowEvents] = useState(false);

  /**
   * Renders a single publication row
   */
  const renderPublicationRow = (publication: Publication) => (
    <tr
      key={`${publication.source}-${publication.seriesTitle}-${publication.date}`}
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onPublicationClick && onPublicationClick(publication)}
    >
      <td className="px-4 py-2">{formatDate(publication.date)}</td>
      <td className="px-4 py-2">{publication.source}</td>
      <td className="px-4 py-2">{publication.seriesTitle}</td>
      <td className="px-4 py-2">{publication.newsletterType}</td>
      <td className="px-4 py-2">Publication</td>
    </tr>
  );

  /**
   * Renders a single event row
   */
  const renderEventRow = (event: Event) => (
    <tr
      key={event.id}
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onEventClick && onEventClick(event)}
    >
      <td className="px-4 py-2">{formatDate(event.startDate)}</td>
      <td className="px-4 py-2"></td>
      <td className="px-4 py-2">{event.title}</td>
      <td className="px-4 py-2">{event.type}</td>
      <td className="px-4 py-2">Event</td>
    </tr>
  );

  /**
   * Renders the table header
   */
  const renderTableHeader = () => (
    <thead>
      <tr className="bg-gray-100">
        <th className="px-4 py-2 text-left">Date</th>
        <th className="px-4 py-2 text-left">Source</th>
        <th className="px-4 py-2 text-left">Title</th>
        <th className="px-4 py-2 text-left">Release</th>
        <th className="px-4 py-2 text-left">Type</th>
      </tr>
    </thead>
  );

  /**
   * Renders the filter controls
   */
  const renderFilters = () => (
    <div className="mb-4 flex gap-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showPublications}
          onChange={(e) => setShowPublications(e.target.checked)}
          className="rounded"
        />
        Publications
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showEvents}
          onChange={(e) => setShowEvents(e.target.checked)}
          className="rounded"
        />
        Events
      </label>
    </div>
  );

  const allItems = [...publications, ...events].sort((a, b) => {
    const dateA = 'seriesTitle' in a ? a.date : a.startDate;
    const dateB = 'seriesTitle' in b ? b.date : b.startDate;
    return dateA.localeCompare(dateB);
  });

  const getItemKey = (item: Publication | Event): string => {
    if ('seriesTitle' in item) {
      return `pub-${item.source}-${item.seriesTitle}-${item.date}`;
    }
    return `event-${item.id}`;
  };

  const getItemDate = (item: Publication | Event): string => {
    return 'seriesTitle' in item ? item.date : item.startDate;
  };

  return (
    <div className="space-y-4">
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
            {allItems.map((item) => {
              const itemDate = 'seriesTitle' in item ? item.date : item.startDate;
              const formattedDate = formatDate(itemDate);
              const isPublication = 'seriesTitle' in item;
              
              return (
                <tr
                  key={getItemKey(item)}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (isPublication && onPublicationClick) {
                      onPublicationClick(item as Publication);
                    } else if (!isPublication && onEventClick) {
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