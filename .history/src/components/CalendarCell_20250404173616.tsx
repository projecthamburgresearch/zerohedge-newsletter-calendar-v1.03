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
  const [pubCarouselIndex, setPubCarouselIndex] = useState(0);
  const [eventCarouselIndex, setEventCarouselIndex] = useState(0);
  
  const publicationsTimer = useRef<NodeJS.Timeout>();
  const eventsTimer = useRef<NodeJS.Timeout>();
  const pubScrollTimer = useRef<NodeJS.Timeout>();
  const eventScrollTimer = useRef<NodeJS.Timeout>();
  const pubCarouselRef = useRef<HTMLDivElement>(null);
  const eventCarouselRef = useRef<HTMLDivElement>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (publicationsTimer.current) clearTimeout(publicationsTimer.current);
      if (eventsTimer.current) clearTimeout(eventsTimer.current);
      if (pubScrollTimer.current) clearTimeout(pubScrollTimer.current);
      if (eventScrollTimer.current) clearTimeout(eventScrollTimer.current);
    };
  }, []);

  // Reset carousel index when hover state changes
  useEffect(() => {
    if (!isPublicationsHovered) {
      setPubCarouselIndex(0);
      if (pubScrollTimer.current) {
        clearTimeout(pubScrollTimer.current);
        pubScrollTimer.current = undefined;
      }
    }
    
    if (!isEventAreaHovered) {
      setEventCarouselIndex(0);
      if (eventScrollTimer.current) {
        clearTimeout(eventScrollTimer.current);
        eventScrollTimer.current = undefined;
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

  // Publications carousel navigation
  const goToPubNext = () => {
    if (pubCarouselIndex < remainingPublications.length - 1) {
      setPubCarouselIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const goToPubPrev = () => {
    if (pubCarouselIndex > 0) {
      setPubCarouselIndex(prev => prev - 1);
      return true;
    }
    return false;
  };
  
  // Event carousel navigation
  const goToEventNext = () => {
    if (eventCarouselIndex < remainingEvents.length - 1) {
      setEventCarouselIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const goToEventPrev = () => {
    if (eventCarouselIndex > 0) {
      setEventCarouselIndex(prev => prev - 1);
      return true;
    }
    return false;
  };

  // Continuous edge scrolling for publications
  const startPubAutoScroll = (direction: 'left' | 'right') => {
    // Clear any existing scroll timer
    if (pubScrollTimer.current) {
      clearTimeout(pubScrollTimer.current);
    }

    // Create a recursive function for continuous scrolling
    const scroll = () => {
      let canContinue = false;
      
      if (direction === 'left') {
        canContinue = goToPubPrev();
      } else {
        canContinue = goToPubNext();
      }
      
      if (canContinue) {
        pubScrollTimer.current = setTimeout(scroll, 800); // Continue scrolling every 800ms
      }
    };

    // Start the first scroll after a 500ms delay
    pubScrollTimer.current = setTimeout(() => {
      scroll();
    }, 500);
  };

  // Stop pub auto-scrolling
  const stopPubAutoScroll = () => {
    if (pubScrollTimer.current) {
      clearTimeout(pubScrollTimer.current);
      pubScrollTimer.current = undefined;
    }
  };

  // Continuous edge scrolling for events
  const startEventAutoScroll = (direction: 'left' | 'right') => {
    // Clear any existing scroll timer
    if (eventScrollTimer.current) {
      clearTimeout(eventScrollTimer.current);
    }

    // Create a recursive function for continuous scrolling
    const scroll = () => {
      let canContinue = false;
      
      if (direction === 'left') {
        canContinue = goToEventPrev();
      } else {
        canContinue = goToEventNext();
      }
      
      if (canContinue) {
        eventScrollTimer.current = setTimeout(scroll, 800); // Continue scrolling every 800ms
      }
    };

    // Start the first scroll after a 500ms delay
    eventScrollTimer.current = setTimeout(() => {
      scroll();
    }, 500);
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

  // Calculate the number of pages for each carousel
  const pubPages = Math.max(1, Math.ceil(remainingPublications.length / 3));
  const eventPages = Math.max(1, Math.ceil(remainingEvents.length / 3));

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

        {/* Publications Carousel */}
        {isPublicationsHovered && remainingPublications.length > 0 && (
          <div 
            className="absolute z-20 bottom-full left-0 w-full bg-white shadow-lg rounded p-2 border mb-1"
            onMouseEnter={handlePublicationsMouseEnter}
            onMouseLeave={handlePublicationsMouseLeave}
          >
            {/* Edge hover zones for auto-scrolling */}
            {pubCarouselIndex > 0 && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-8 z-30 bg-gradient-to-r from-white/80 to-transparent flex items-center justify-start cursor-pointer"
                onMouseEnter={() => startPubAutoScroll('left')}
                onMouseLeave={stopPubAutoScroll}
                onClick={goToPubPrev}
              >
                <div className="text-brand-yellow-400 opacity-70 hover:opacity-100 pl-1">
                  ◄
                </div>
              </div>
            )}
            
            {pubCarouselIndex < remainingPublications.length - 1 && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-8 z-30 bg-gradient-to-l from-white/80 to-transparent flex items-center justify-end cursor-pointer"
                onMouseEnter={() => startPubAutoScroll('right')}
                onMouseLeave={stopPubAutoScroll}
                onClick={goToPubNext}
              >
                <div className="text-brand-yellow-400 opacity-70 hover:opacity-100 pr-1">
                  ►
                </div>
              </div>
            )}
            
            {/* Carousel container */}
            <div className="relative overflow-hidden px-4">
              <div 
                ref={pubCarouselRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(calc(-${pubCarouselIndex * 100}% + ${pubCarouselIndex > 0 ? '25px' : '0px'}))` }}
              >
                {remainingPublications.map((pub, index) => (
                  <div
                    key={`${pub.source}-${pub.seriesTitle}-${index}`}
                    onClick={() => onPublicationClick(pub)}
                    className={`
                      min-w-[80%] px-2 flex-shrink-0 mx-1 py-2 rounded cursor-pointer
                      transition-all duration-300 ease-in-out
                      ${pubCarouselIndex === index 
                        ? 'bg-brand-yellow-100 scale-100 opacity-100' 
                        : 'bg-gray-50 scale-95 opacity-75'}
                      hover:bg-brand-yellow-100 hover:opacity-100
                    `}
                  >
                    <div className="text-xs">
                      <span className="font-semibold block truncate">{pub.source}</span>
                      <span className="text-gray-600 block mt-1">{pub.seriesTitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation dots */}
            {remainingPublications.length > 1 && (
              <div className="flex justify-center mt-2 gap-1">
                {remainingPublications.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPubCarouselIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === pubCarouselIndex ? 'w-4 bg-brand-yellow-300' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to item ${index + 1}`}
                  />
                ))}
              </div>
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

        {/* Events Carousel */}
        {isEventAreaHovered && remainingEvents.length > 0 && (
          <div 
            className="absolute z-20 top-full left-0 w-full bg-white shadow-lg rounded p-2 border mt-1"
            onMouseEnter={handleEventAreaMouseEnter}
            onMouseLeave={handleEventAreaMouseLeave}
          >
            {/* Edge hover zones for auto-scrolling */}
            {eventCarouselIndex > 0 && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-8 z-30 bg-gradient-to-r from-white/80 to-transparent flex items-center justify-start cursor-pointer"
                onMouseEnter={() => startEventAutoScroll('left')}
                onMouseLeave={stopEventAutoScroll}
                onClick={goToEventPrev}
              >
                <div className="text-gray-500 opacity-70 hover:opacity-100 pl-1">
                  ◄
                </div>
              </div>
            )}
            
            {eventCarouselIndex < remainingEvents.length - 1 && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-8 z-30 bg-gradient-to-l from-white/80 to-transparent flex items-center justify-end cursor-pointer"
                onMouseEnter={() => startEventAutoScroll('right')}
                onMouseLeave={stopEventAutoScroll}
                onClick={goToEventNext}
              >
                <div className="text-gray-500 opacity-70 hover:opacity-100 pr-1">
                  ►
                </div>
              </div>
            )}
            
            {/* Carousel container */}
            <div className="relative overflow-hidden px-4">
              <div 
                ref={eventCarouselRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(calc(-${eventCarouselIndex * 100}% + ${eventCarouselIndex > 0 ? '25px' : '0px'}))` }}
              >
                {remainingEvents.map((event, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    onClick={() => onEventClick(event)}
                    className={`
                      min-w-[80%] px-2 flex-shrink-0 mx-1 py-2 rounded cursor-pointer
                      transition-all duration-300 ease-in-out
                      ${eventCarouselIndex === index 
                        ? getEventTypeColor(event.type).replace('hover:bg-', '') + ' scale-100 opacity-100' 
                        : 'bg-gray-50 scale-95 opacity-75'}
                      ${getEventTypeColor(event.type).includes('hover:bg-') 
                        ? getEventTypeColor(event.type).split(' ').find(c => c.startsWith('hover:bg-')) 
                        : 'hover:bg-gray-100'} hover:opacity-100
                    `}
                  >
                    <div className="text-xs">
                      <span className="font-semibold block truncate">{event.title}</span>
                      <span className="text-gray-700 block mt-1">{event.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation dots */}
            {remainingEvents.length > 1 && (
              <div className="flex justify-center mt-2 gap-1">
                {remainingEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setEventCarouselIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === eventCarouselIndex ? 'w-4 bg-gray-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to event ${index + 1}`}
                  />
                ))}
              </div>
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