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
  const [pubScrollPosition, setPubScrollPosition] = useState(0);
  const [eventScrollPosition, setEventScrollPosition] = useState(0);
  const [isScrollingPubs, setIsScrollingPubs] = useState(false);
  const [isScrollingEvents, setIsScrollingEvents] = useState(false);
  
  const publicationsTimer = useRef<NodeJS.Timeout>();
  const eventsTimer = useRef<NodeJS.Timeout>();
  const pubScrollTimer = useRef<NodeJS.Timeout>();
  const eventScrollTimer = useRef<NodeJS.Timeout>();
  const pubListRef = useRef<HTMLDivElement>(null);
  const eventListRef = useRef<HTMLDivElement>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (publicationsTimer.current) clearTimeout(publicationsTimer.current);
      if (eventsTimer.current) clearTimeout(eventsTimer.current);
      if (pubScrollTimer.current) clearInterval(pubScrollTimer.current);
      if (eventScrollTimer.current) clearInterval(eventScrollTimer.current);
    };
  }, []);

  // Reset scroll position when hover state changes
  useEffect(() => {
    if (!isPublicationsHovered) {
      setPubScrollPosition(0);
      stopPubScroll();
    }
    
    if (!isEventAreaHovered) {
      setEventScrollPosition(0);
      stopEventScroll();
    }
  }, [isPublicationsHovered, isEventAreaHovered]);

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

  // Publications scroll automation
  const startPubScroll = (direction: 'up' | 'down') => {
    if (isScrollingPubs) return;
    
    setIsScrollingPubs(true);
    
    if (pubScrollTimer.current) {
      clearInterval(pubScrollTimer.current);
    }
    
    pubScrollTimer.current = setInterval(() => {
      if (!pubListRef.current) return;
      
      const listHeight = pubListRef.current.scrollHeight;
      const visibleHeight = pubListRef.current.clientHeight;
      const maxScroll = Math.max(0, listHeight - visibleHeight);
      
      setPubScrollPosition(prev => {
        const step = 1; // pixels to scroll each time
        let newPosition;
        
        if (direction === 'down') {
          newPosition = Math.min(prev + step, maxScroll);
          if (newPosition >= maxScroll) {
            stopPubScroll();
          }
        } else { // up
          newPosition = Math.max(prev - step, 0);
          if (newPosition <= 0) {
            stopPubScroll();
          }
        }
        
        return newPosition;
      });
    }, 20);
  };
  
  // Stop publications scrolling
  const stopPubScroll = () => {
    setIsScrollingPubs(false);
    if (pubScrollTimer.current) {
      clearInterval(pubScrollTimer.current);
      pubScrollTimer.current = undefined;
    }
  };
  
  // Events scroll automation
  const startEventScroll = (direction: 'up' | 'down') => {
    if (isScrollingEvents) return;
    
    setIsScrollingEvents(true);
    
    if (eventScrollTimer.current) {
      clearInterval(eventScrollTimer.current);
    }
    
    eventScrollTimer.current = setInterval(() => {
      if (!eventListRef.current) return;
      
      const listHeight = eventListRef.current.scrollHeight;
      const visibleHeight = eventListRef.current.clientHeight;
      const maxScroll = Math.max(0, listHeight - visibleHeight);
      
      setEventScrollPosition(prev => {
        const step = 1; // pixels to scroll each time
        let newPosition;
        
        if (direction === 'down') {
          newPosition = Math.min(prev + step, maxScroll);
          if (newPosition >= maxScroll) {
            stopEventScroll();
          }
        } else { // up
          newPosition = Math.max(prev - step, 0);
          if (newPosition <= 0) {
            stopEventScroll();
          }
        }
        
        return newPosition;
      });
    }, 20);
  };
  
  // Stop events scrolling
  const stopEventScroll = () => {
    setIsScrollingEvents(false);
    if (eventScrollTimer.current) {
      clearInterval(eventScrollTimer.current);
      eventScrollTimer.current = undefined;
    }
  };

  // Handle publication click and hide dropdown
  const handlePubClick = (pub: Publication) => {
    onPublicationClick(pub);
    setIsPublicationsHovered(false);
  };

  // Handle event click and hide dropdown
  const handleEventClick = (event: Event) => {
    onEventClick(event);
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
            onClick={() => handlePubClick(pub)}
            className="text-xs p-1 bg-brand-yellow-100 rounded cursor-pointer hover:bg-brand-yellow-200 whitespace-nowrap overflow-hidden"
            title={`${pub.source} - ${pub.seriesTitle}`}
          >
            <span className="font-semibold inline-block">{getAbbreviatedSource(pub.source)}</span>
            <span className="mx-1">-</span>
            <span className="inline-block truncate max-w-[calc(100%-50px)] align-bottom">{pub.seriesTitle}</span>
          </div>
        ))}

        {/* Publications Menu */}
        {isPublicationsHovered && remainingPublications.length > 0 && (
          <div 
            className="absolute z-20 bottom-full left-0 w-full bg-white shadow-lg rounded border mb-1"
            onMouseEnter={handlePublicationsMouseEnter}
            onMouseLeave={handlePublicationsMouseLeave}
          >
            {/* Debug info */}
            <div className="text-xs text-gray-500 text-center">
              {Math.round(pubScrollPosition)}px / 
              {pubListRef.current ? Math.round(pubListRef.current.scrollHeight - 160) : '?'}px
            </div>
            
            {/* Up arrow - always show it if there's scrolling happening */}
            {pubScrollPosition > 2 && (
              <button
                className="w-full bg-brand-yellow-100 text-black font-bold py-1 border-b border-gray-300 hover:bg-brand-yellow-200 flex justify-center"
                onMouseEnter={() => startPubScroll('up')}
                onMouseLeave={stopPubScroll}
              >
                ▲ UP ▲
              </button>
            )}
            
            {/* Menu items */}
            <div className={`overflow-hidden ${remainingPublications.length > 4 ? 'h-[160px]' : 'max-h-[160px]'}`}>
              <div 
                ref={pubListRef}
                className="pt-1 px-1 pb-1 space-y-1"
                style={{ transform: `translateY(-${pubScrollPosition}px)`, transition: 'transform 0.1s ease-out' }}
              >
                {remainingPublications.map((pub, index) => (
                  <div
                    key={`pub-${index}`}
                    onClick={() => handlePubClick(pub)}
                    className="text-xs p-2 rounded cursor-pointer hover:bg-brand-yellow-100"
                  >
                    <div className="font-semibold">{pub.source}</div>
                    <div className="text-gray-600 mt-1">
                      {pub.seriesTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Down arrow - show whenever we have more content than visible */}
            {(pubListRef.current && 
              pubScrollPosition < Math.max(0, pubListRef.current.scrollHeight - 170) &&
              remainingPublications.length > 3) && (
              <button
                className="w-full bg-brand-yellow-100 text-black font-bold py-1 border-t border-gray-300 hover:bg-brand-yellow-200 flex justify-center"
                onMouseEnter={() => startPubScroll('down')}
                onMouseLeave={stopPubScroll}
              >
                ▼ DOWN ▼
              </button>
            )}
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
            onClick={() => handleEventClick(currentEvent)}
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

        {/* Events Menu */}
        {isEventAreaHovered && remainingEvents.length > 0 && (
          <div 
            className="absolute z-20 top-full left-0 w-full bg-white shadow-lg rounded border mt-1"
            onMouseEnter={handleEventAreaMouseEnter}
            onMouseLeave={handleEventAreaMouseLeave}
          >
            {/* Debug info */}
            <div className="text-xs text-gray-500 text-center">
              {Math.round(eventScrollPosition)}px / 
              {eventListRef.current ? Math.round(eventListRef.current.scrollHeight - 160) : '?'}px
            </div>
            
            {/* Up arrow */}
            {eventScrollPosition > 2 && (
              <button
                className="w-full bg-gray-100 text-black font-bold py-1 border-b border-gray-300 hover:bg-gray-200 flex justify-center"
                onMouseEnter={() => startEventScroll('up')}
                onMouseLeave={stopEventScroll}
              >
                ▲ UP ▲
              </button>
            )}
            
            {/* Menu items */}
            <div className={`overflow-hidden ${remainingEvents.length > 4 ? 'h-[160px]' : 'max-h-[160px]'}`}>
              <div 
                ref={eventListRef}
                className="pt-1 px-1 pb-1 space-y-1"
                style={{ transform: `translateY(-${eventScrollPosition}px)`, transition: 'transform 0.1s ease-out' }}
              >
                {remainingEvents.map((event, index) => (
                  <div
                    key={`event-${index}`}
                    onClick={() => handleEventClick(event)}
                    className={`
                      text-xs p-2 rounded cursor-pointer
                      ${getEventTypeColor(event.type)}
                    `}
                  >
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-gray-600 mt-1">
                      {event.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Down arrow */}
            {(eventListRef.current && 
              eventScrollPosition < Math.max(0, eventListRef.current.scrollHeight - 170) &&
              remainingEvents.length > 3) && (
              <button
                className="w-full bg-gray-100 text-black font-bold py-1 border-t border-gray-300 hover:bg-gray-200 flex justify-center"
                onMouseEnter={() => startEventScroll('down')}
                onMouseLeave={stopEventScroll}
              >
                ▼ DOWN ▼
              </button>
            )}
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