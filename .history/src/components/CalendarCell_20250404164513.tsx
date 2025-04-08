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
  const [pubActiveIndex, setPubActiveIndex] = useState(0);
  const [eventActiveIndex, setEventActiveIndex] = useState(0);
  
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
      if (pubScrollTimer.current) clearTimeout(pubScrollTimer.current);
      if (eventScrollTimer.current) clearTimeout(eventScrollTimer.current);
    };
  }, []);

  // Reset active index when hover state changes
  useEffect(() => {
    if (!isPublicationsHovered) {
      setPubActiveIndex(0);
      if (pubScrollTimer.current) {
        clearTimeout(pubScrollTimer.current);
        pubScrollTimer.current = undefined;
      }
      if (pubListRef.current) {
        pubListRef.current.scrollTop = 0;
      }
    }
    
    if (!isEventAreaHovered) {
      setEventActiveIndex(0);
      if (eventScrollTimer.current) {
        clearTimeout(eventScrollTimer.current);
        eventScrollTimer.current = undefined;
      }
      if (eventListRef.current) {
        eventListRef.current.scrollTop = 0;
      }
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

  // Scroll publications carousel to index and move the actual list
  const scrollPubTo = (index: number) => {
    if (index >= 0 && index < remainingPublications.length) {
      setPubActiveIndex(index);
      scrollPubListToIndex(index);
    }
  };

  // Scroll events carousel to index and move the actual list
  const scrollEventTo = (index: number) => {
    if (index >= 0 && index < remainingEvents.length) {
      setEventActiveIndex(index);
      scrollEventListToIndex(index);
    }
  };

  // Physically scroll the publications list to keep active item visible
  const scrollPubListToIndex = (index: number) => {
    if (!pubListRef.current) return;
    
    const listItems = pubListRef.current.children;
    if (index < listItems.length) {
      const targetItem = listItems[index] as HTMLElement;
      const listContainer = pubListRef.current;
      
      // Calculate scroll position to center the item
      const itemTop = targetItem.offsetTop;
      const containerHeight = listContainer.clientHeight;
      const itemHeight = targetItem.clientHeight;
      
      listContainer.scrollTo({
        top: itemTop - (containerHeight / 2) + (itemHeight / 2),
        behavior: 'smooth'
      });
    }
  };

  // Physically scroll the events list to keep active item visible
  const scrollEventListToIndex = (index: number) => {
    if (!eventListRef.current) return;
    
    const listItems = eventListRef.current.children;
    if (index < listItems.length) {
      const targetItem = listItems[index] as HTMLElement;
      const listContainer = eventListRef.current;
      
      // Calculate scroll position to center the item
      const itemTop = targetItem.offsetTop;
      const containerHeight = listContainer.clientHeight;
      const itemHeight = targetItem.clientHeight;
      
      listContainer.scrollTo({
        top: itemTop - (containerHeight / 2) + (itemHeight / 2),
        behavior: 'smooth'
      });
    }
  };

  // Start auto-scrolling for publications and move the list items
  const startPubAutoScroll = (direction: number) => {
    if (pubScrollTimer.current) {
      clearTimeout(pubScrollTimer.current);
    }
    
    const scroll = () => {
      setPubActiveIndex(prev => {
        // If we're at the first item and going up, loop to the end
        if (prev === 0 && direction < 0) {
          const newIndex = remainingPublications.length - 1;
          scrollPubListToIndex(newIndex);
          return newIndex;
        }
        
        // If we're at the last item and going down, loop to the start
        if (prev === remainingPublications.length - 1 && direction > 0) {
          scrollPubListToIndex(0);
          return 0;
        }
        
        // Otherwise move in the specified direction
        const newIndex = Math.max(0, Math.min(remainingPublications.length - 1, prev + direction));
        scrollPubListToIndex(newIndex);
        return newIndex;
      });
      
      // Continue scrolling
      pubScrollTimer.current = setTimeout(scroll, 1000);
    };
    
    // Start scrolling after initial delay
    pubScrollTimer.current = setTimeout(scroll, 500);
  };

  // Start auto-scrolling for events and move the list items
  const startEventAutoScroll = (direction: number) => {
    if (eventScrollTimer.current) {
      clearTimeout(eventScrollTimer.current);
    }
    
    const scroll = () => {
      setEventActiveIndex(prev => {
        // If we're at the first item and going up, loop to the end
        if (prev === 0 && direction < 0) {
          const newIndex = remainingEvents.length - 1;
          scrollEventListToIndex(newIndex);
          return newIndex;
        }
        
        // If we're at the last item and going down, loop to the start
        if (prev === remainingEvents.length - 1 && direction > 0) {
          scrollEventListToIndex(0);
          return 0;
        }
        
        // Otherwise move in the specified direction
        const newIndex = Math.max(0, Math.min(remainingEvents.length - 1, prev + direction));
        scrollEventListToIndex(newIndex);
        return newIndex;
      });
      
      // Continue scrolling
      eventScrollTimer.current = setTimeout(scroll, 1000);
    };
    
    // Start scrolling after initial delay
    eventScrollTimer.current = setTimeout(scroll, 500);
  };

  // Stop pub auto-scrolling
  const stopPubAutoScroll = () => {
    if (pubScrollTimer.current) {
      clearTimeout(pubScrollTimer.current);
      pubScrollTimer.current = undefined;
    }
  };

  // Stop event auto-scrolling
  const stopEventAutoScroll = () => {
    if (eventScrollTimer.current) {
      clearTimeout(eventScrollTimer.current);
      eventScrollTimer.current = undefined;
    }
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

        {/* Publications Carousel - Simple Clean Version */}
        {isPublicationsHovered && remainingPublications.length > 0 && (
          <div 
            className="absolute z-20 bottom-full left-0 w-full bg-white shadow-lg rounded-md p-2 border mb-1"
            onMouseEnter={handlePublicationsMouseEnter}
            onMouseLeave={handlePublicationsMouseLeave}
          >
            <div className="relative">
              {/* Item list - scrollable container */}
              <div
                ref={pubListRef}
                className="flex flex-col space-y-1 max-h-[150px] overflow-auto"
              >
                {remainingPublications.map((pub, index) => {
                  const isActive = index === pubActiveIndex;
                  
                  return (
                    <div
                      key={`${pub.source}-${pub.seriesTitle}-${index}`}
                      className={`
                        text-xs p-2 rounded cursor-pointer transition-all
                        ${isActive ? 'bg-brand-yellow-100' : 'bg-white hover:bg-brand-yellow-50'}
                      `}
                      onClick={() => onPublicationClick(pub)}
                      onMouseEnter={() => {
                        // Clear any existing timers
                        if (pubScrollTimer.current) {
                          clearTimeout(pubScrollTimer.current);
                        }
                        
                        // Set active index immediately and scroll to it
                        setPubActiveIndex(index);
                        scrollPubListToIndex(index);
                        
                        // Start auto-scrolling when hovering the first or last item
                        if (index === 0) {
                          startPubAutoScroll(1); // Scroll down
                        } else if (index === remainingPublications.length - 1) {
                          startPubAutoScroll(-1); // Scroll up
                        }
                      }}
                      onMouseLeave={stopPubAutoScroll}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold ${isActive ? 'text-black' : 'text-gray-700'}`}>
                          {pub.source}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {pub.newsletterType || 'Publication'}
                        </span>
                      </div>
                      <div className={`mt-1 truncate ${isActive ? 'text-gray-800' : 'text-gray-600'} text-[10px]`}>
                        {pub.seriesTitle}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Navigation dots */}
              {remainingPublications.length > 1 && (
                <div className="flex justify-center mt-2 gap-1">
                  {remainingPublications.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollPubTo(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === pubActiveIndex 
                          ? 'w-4 bg-brand-yellow-300' 
                          : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to publication ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
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

        {/* Events Carousel - Simple Clean Version */}
        {isEventAreaHovered && remainingEvents.length > 0 && (
          <div 
            className="absolute z-20 top-full left-0 w-full bg-white shadow-lg rounded-md p-2 border mt-1"
            onMouseEnter={handleEventAreaMouseEnter}
            onMouseLeave={handleEventAreaMouseLeave}
          >
            <div className="relative">
              {/* Item list - scrollable container */}
              <div
                ref={eventListRef}
                className="flex flex-col space-y-1 max-h-[150px] overflow-auto"
              >
                {remainingEvents.map((event, index) => {
                  const isActive = index === eventActiveIndex;
                  
                  return (
                    <div
                      key={`${event.id}-${index}`}
                      className={`
                        text-xs p-2 rounded cursor-pointer transition-all
                        ${isActive ? getEventTypeColor(event.type) : 'bg-white hover:bg-gray-50'}
                      `}
                      onClick={() => onEventClick(event)}
                      onMouseEnter={() => {
                        // Clear any existing timers
                        if (eventScrollTimer.current) {
                          clearTimeout(eventScrollTimer.current);
                        }
                        
                        // Set active index immediately and scroll to it
                        setEventActiveIndex(index);
                        scrollEventListToIndex(index);
                        
                        // Start auto-scrolling when hovering the first or last item
                        if (index === 0) {
                          startEventAutoScroll(1); // Scroll down
                        } else if (index === remainingEvents.length - 1) {
                          startEventAutoScroll(-1); // Scroll up
                        }
                      }}
                      onMouseLeave={stopEventAutoScroll}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold ${isActive ? 'text-gray-800' : 'text-gray-700'}`}>
                          {event.title}
                        </span>
                        <span className="text-[9px] text-gray-600">
                          {event.type}
                        </span>
                      </div>
                      <div className={`mt-1 truncate ${isActive ? 'text-gray-700' : 'text-gray-500'} text-[10px]`}>
                        {event.description || ''}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Navigation dots */}
              {remainingEvents.length > 1 && (
                <div className="flex justify-center mt-2 gap-1">
                  {remainingEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollEventTo(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === eventActiveIndex 
                          ? 'w-4 bg-gray-500' 
                          : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to event ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
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