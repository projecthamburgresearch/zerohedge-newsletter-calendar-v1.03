import React, { useState, useEffect, useRef } from 'react';
import { Publication, Event, SourceGroup, CalendarDay } from '@/types';
import { getAbbreviatedSource } from '@/utils/dateUtils';
import { getTypeColor } from '@/utils/uiUtils';
import { groupPublicationsBySource } from '@/utils/publicationUtils';

interface CalendarCellProps {
  day: CalendarDay;
  publications: Publication[];
  events: Event[];
  onPublicationClick: (publication: Publication) => void;
  onEventClick: (event: Event) => void;
}

/**
 * Renders a single cell in the calendar grid
 */
export const CalendarCell: React.FC<CalendarCellProps> = ({
  day,
  publications,
  events,
  onPublicationClick,
  onEventClick
}) => {
  const [isPublicationsHovered, setIsPublicationsHovered] = useState(false);
  const [isEventAreaHovered, setIsEventAreaHovered] = useState(false);
  
  const publicationsTimer = useRef<NodeJS.Timeout>();
  const eventsTimer = useRef<NodeJS.Timeout>();

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (publicationsTimer.current) clearTimeout(publicationsTimer.current);
      if (eventsTimer.current) clearTimeout(eventsTimer.current);
    };
  }, []);

  const handlePublicationsMouseEnter = () => {
    if (eventsTimer.current) clearTimeout(eventsTimer.current);
    publicationsTimer.current = setTimeout(() => {
      setIsPublicationsHovered(true);
    }, 300);
  };

  const handlePublicationsMouseLeave = () => {
    if (publicationsTimer.current) {
      clearTimeout(publicationsTimer.current);
      publicationsTimer.current = undefined;
    }
    setIsPublicationsHovered(false);
  };

  const handleEventAreaMouseEnter = () => {
    if (publicationsTimer.current) clearTimeout(publicationsTimer.current);
    eventsTimer.current = setTimeout(() => {
      setIsEventAreaHovered(true);
    }, 300);
  };

  const handleEventAreaMouseLeave = () => {
    if (eventsTimer.current) {
      clearTimeout(eventsTimer.current);
      eventsTimer.current = undefined;
    }
    setIsEventAreaHovered(false);
  };

  // If it's an empty day, render an empty cell
  if (day.isEmpty) {
    return <div className="p-2 bg-gray-50 h-[100px]" />;
  }

  // Get visible and remaining publications
  const visiblePublications = publications.slice(0, 2);
  const remainingPublications = publications.slice(2);

  // Get the first event to display
  const currentEvent = events[0];
  const remainingEvents = events.slice(1);

  const isCurrentDay = day.date === new Date().toISOString().slice(0, 10).replace(/-/g, '');

  return (
    <div className={`p-2 border ${
      isCurrentDay ? 'bg-brand-yellow-50' : 'bg-white'
    } h-[100px] relative hover:shadow-lg transition-shadow`}>
      {/* Day Number */}
      <div className="text-right text-gray-600 mb-1">
        {day.day}
      </div>

      {/* Publications Container - Fixed height for 2 items */}
      <div 
        className="space-y-1 max-h-[40px] relative"
        onMouseEnter={handlePublicationsMouseEnter}
        onMouseLeave={handlePublicationsMouseLeave}
      >
        {visiblePublications.map((pub, index) => (
          <div
            key={`${pub.source}-${pub.seriesTitle}-${index}`}
            onClick={() => onPublicationClick(pub)}
            className="text-xs p-1 bg-brand-yellow-100 rounded cursor-pointer hover:bg-brand-yellow-200 whitespace-nowrap overflow-hidden"
            title={`${pub.source} - ${pub.seriesTitle}`}
          >
            <span className="font-semibold inline-block">{getAbbreviatedSource(pub.source)}</span>
            <span className="mx-1">-</span>
            <span className="inline-block truncate max-w-[calc(100%-50px)] align-bottom">{pub.seriesTitle}</span>
          </div>
        ))}

        {/* Hover Dropup for Publications */}
        {isPublicationsHovered && remainingPublications.length > 0 && (
          <div 
            className="absolute z-10 bottom-full left-0 w-full bg-white shadow-lg rounded p-2 border mb-1"
            onMouseEnter={handlePublicationsMouseEnter}
            onMouseLeave={handlePublicationsMouseLeave}
          >
            {remainingPublications.map((pub, index) => (
              <div
                key={`${pub.source}-${pub.seriesTitle}-${index}`}
                onClick={() => onPublicationClick(pub)}
                className="text-xs p-1 rounded cursor-pointer hover:bg-brand-yellow-100 mb-1 last:mb-0"
              >
                <span className="font-semibold">{pub.source}</span>
                <br />
                <span className="text-gray-600">{pub.seriesTitle}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

      {/* Publications Count Badge (if more than shown) */}
      {remainingPublications.length > 0 && (
        <div className="absolute top-2 right-2 bg-brand-yellow-200 rounded-full w-5 h-5 flex items-center justify-center text-xs">
          +{remainingPublications.length}
            </div>
          )}
          
      {/* Event Area - Contains event and dropdown */}
      <div
        className="absolute bottom-2 left-2 right-2"
        onMouseEnter={handleEventAreaMouseEnter}
        onMouseLeave={handleEventAreaMouseLeave}
      >
        {/* Event (if any) */}
        {currentEvent && (
          <div
            onClick={() => onEventClick(currentEvent)}
            className={`
              text-xs p-1 rounded cursor-pointer
              whitespace-nowrap overflow-hidden
              ${getEventTypeColor(currentEvent.type)}
            `}
            title={currentEvent.title}
          >
            <span className="inline-block truncate w-[calc(100%-20px)]">{currentEvent.title}</span>
            {remainingEvents.length > 0 && (
              <span className="inline-block w-4 text-center ml-1">
                +{remainingEvents.length}
                          </span>
                        )}
                      </div>
        )}

        {/* Hover Dropdown for Events */}
        {isEventAreaHovered && remainingEvents.length > 0 && (
          <div className="absolute z-10 top-full left-0 w-full bg-white shadow-lg rounded p-2 border">
            {remainingEvents.map((event, index) => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`
                  text-xs p-1 rounded cursor-pointer mb-1 last:mb-0
                  ${getEventTypeColor(event.type)}
                `}
              >
                {event.title}
                    </div>
                  ))}
            </div>
          )}
      </div>
    </div>
  );
};

// Helper function to get event type color
const getEventTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Economic': 'bg-green-100 hover:bg-green-200',
    'Market': 'bg-yellow-100 hover:bg-yellow-200',
    'Political': 'bg-red-100 hover:bg-red-200',
    'Corporate': 'bg-purple-100 hover:bg-purple-200',
    'Social': 'bg-pink-100 hover:bg-pink-200'
  };
  
  return colors[type] || 'bg-gray-100 hover:bg-gray-200';
}; 