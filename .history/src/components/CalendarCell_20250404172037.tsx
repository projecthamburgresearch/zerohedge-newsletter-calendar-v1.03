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

  // Debugging helper to monitor scrolling
  useEffect(() => {
    console.log('Pub carousel index:', pubCarouselIndex);
  }, [pubCarouselIndex]);

  useEffect(() => {
    console.log('Event carousel index:', eventCarouselIndex);
  }, [eventCarouselIndex]);

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
    const maxIndex = remainingPublications.length - 1;
    console.log('goToPubNext - current:', pubCarouselIndex, 'max:', maxIndex);
    
    // Circular navigation - if at last item, go to first
    if (pubCarouselIndex >= maxIndex) {
      setPubCarouselIndex(0);
    } else {
      setPubCarouselIndex(prev => prev + 1);
    }
    return true; // Always return true since we can always scroll in a circular carousel
  };

  const goToPubPrev = () => {
    console.log('goToPubPrev - current:', pubCarouselIndex);
    const maxIndex = remainingPublications.length - 1;
    
    // Circular navigation - if at first item, go to last
    if (pubCarouselIndex <= 0) {
      setPubCarouselIndex(maxIndex);
    } else {
      setPubCarouselIndex(prev => prev - 1);
    }
    return true; // Always return true since we can always scroll in a circular carousel
  };
  
  // Event carousel navigation
  const goToEventNext = () => {
    const maxIndex = remainingEvents.length - 1;
    console.log('goToEventNext - current:', eventCarouselIndex, 'max:', maxIndex);
    
    // Circular navigation - if at last item, go to first
    if (eventCarouselIndex >= maxIndex) {
      setEventCarouselIndex(0);
    } else {
      setEventCarouselIndex(prev => prev + 1);
    }
    return true; // Always return true since we can always scroll in a circular carousel
  };

  const goToEventPrev = () => {
    console.log('goToEventPrev - current:', eventCarouselIndex);
    const maxIndex = remainingEvents.length - 1;
    
    // Circular navigation - if at first item, go to last
    if (eventCarouselIndex <= 0) {
      setEventCarouselIndex(maxIndex);
    } else {
      setEventCarouselIndex(prev => prev - 1);
    }
    return true; // Always return true since we can always scroll in a circular carousel
  };

  // Continuous edge scrolling for publications
  const startPubAutoScroll = (direction: 'top' | 'bottom') => {
    // Clear any existing scroll timer
    if (pubScrollTimer.current) {
      clearTimeout(pubScrollTimer.current);
      pubScrollTimer.current = undefined;
    }

    console.log('Starting pub auto-scroll:', direction);

    // Create a recursive function for continuous scrolling
    const scroll = () => {
      let canContinue = false;
      
      if (direction === 'top') {
        canContinue = goToPubPrev();
      } else {
        canContinue = goToPubNext();
      }
      
      if (canContinue) {
        pubScrollTimer.current = setTimeout(scroll, 800); // Continue scrolling every 800ms
      }
    };

    // Start the first scroll immediately to ensure responsiveness
    scroll();
  };

  // Stop pub auto-scrolling
  const stopPubAutoScroll = () => {
    if (pubScrollTimer.current) {
      clearTimeout(pubScrollTimer.current);
      pubScrollTimer.current = undefined;
    }
  };

  // Continuous edge scrolling for events
  const startEventAutoScroll = (direction: 'top' | 'bottom') => {
    // Clear any existing scroll timer
    if (eventScrollTimer.current) {
      clearTimeout(eventScrollTimer.current);
      eventScrollTimer.current = undefined;
    }

    console.log('Starting event auto-scroll:', direction);

    // Create a recursive function for continuous scrolling
    const scroll = () => {
      let canContinue = false;
      
      if (direction === 'top') {
        canContinue = goToEventPrev();
      } else {
        canContinue = goToEventNext();
      }
      
      if (canContinue) {
        eventScrollTimer.current = setTimeout(scroll, 800); // Continue scrolling every 800ms
      }
    };

    // Start the first scroll immediately to ensure responsiveness
    scroll();
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

  // Calculate the number of pages for each carousel - ensure we never exceed actual content
  const ITEMS_PER_VIEW = 3; // Show 3 items at a time
  const pubPages = Math.max(1, Math.ceil(remainingPublications.length / ITEMS_PER_VIEW));
  const eventPages = Math.max(1, Math.ceil(remainingEvents.length / ITEMS_PER_VIEW));

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
            {/* Edge hover zones for auto-scrolling - always visible with circular scrolling */}
            <div 
              className="absolute left-0 right-0 top-0 h-6 z-30 bg-gradient-to-b from-white/80 to-transparent cursor-pointer"
              onMouseEnter={() => startPubAutoScroll('top')}
              onMouseLeave={stopPubAutoScroll}
              onClick={goToPubPrev}
            />
            
            <div 
              className="absolute left-0 right-0 bottom-0 h-6 z-30 bg-gradient-to-t from-white/80 to-transparent cursor-pointer"
              onMouseEnter={() => startPubAutoScroll('bottom')}
              onMouseLeave={stopPubAutoScroll}
              onClick={goToPubNext}
            />
            
            {/* Carousel container */}
            <div className="relative overflow-hidden max-h-[120px] py-1">
              <div 
                ref={pubCarouselRef}
                className="flex flex-col transition-transform duration-300 ease-in-out"
                style={{ transform: `translateY(-${pubCarouselIndex * 34}px)` }}
              >
                {/* Add padding at the beginning for circular effect */}
                {pubCarouselIndex === 0 && remainingPublications.length > ITEMS_PER_VIEW && (
                  <div className="opacity-0 h-0 overflow-hidden">
                    {remainingPublications.slice(-1).map((pub, index) => (
                      <div
                        key={`pre-${pub.source}-${pub.seriesTitle}-${index}`}
                        className="invisible"
                      />
                    ))}
                  </div>
                )}
                
                {remainingPublications.map((pub, index) => (
                  <div
                    key={`${pub.source}-${pub.seriesTitle}-${index}`}
                    onClick={() => onPublicationClick(pub)}
                    className="text-xs p-2 rounded cursor-pointer hover:bg-brand-yellow-100 transition-all mb-2 last:mb-0 h-[34px] overflow-hidden"
                  >
                    <span className="font-semibold block truncate">{pub.source}</span>
                    <span className="text-gray-600 truncate text-[10px] mt-0.5 block">{pub.seriesTitle}</span>
                  </div>
                ))}
                
                {/* Add padding at the end for circular effect */}
                {pubCarouselIndex === remainingPublications.length - 1 && remainingPublications.length > ITEMS_PER_VIEW && (
                  <div className="opacity-0 h-0 overflow-hidden">
                    {remainingPublications.slice(0, 1).map((pub, index) => (
                      <div
                        key={`post-${pub.source}-${pub.seriesTitle}-${index}`}
                        className="invisible"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation dots - now one dot per item */}
            {remainingPublications.length > ITEMS_PER_VIEW && (
              <div className="flex justify-center mt-2 gap-1 overflow-x-auto max-w-full px-2">
                {remainingPublications.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPubCarouselIndex(index)}
                    className={`h-1.5 rounded-full transition-all flex-shrink-0 ${
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
            {/* Edge hover zones for auto-scrolling - always visible with circular scrolling */}
            <div 
              className="absolute left-0 right-0 top-0 h-6 z-30 bg-gradient-to-b from-white/80 to-transparent cursor-pointer"
              onMouseEnter={() => startEventAutoScroll('top')}
              onMouseLeave={stopEventAutoScroll}
              onClick={goToEventPrev}
            />
            
            <div 
              className="absolute left-0 right-0 bottom-0 h-6 z-30 bg-gradient-to-t from-white/80 to-transparent cursor-pointer"
              onMouseEnter={() => startEventAutoScroll('bottom')}
              onMouseLeave={stopEventAutoScroll}
              onClick={goToEventNext}
            />
            
            {/* Carousel container */}
            <div className="relative overflow-hidden max-h-[120px] py-1">
              <div 
                ref={eventCarouselRef}
                className="flex flex-col transition-transform duration-300 ease-in-out"
                style={{ transform: `translateY(-${eventCarouselIndex * 34}px)` }}
              >
                {/* Add padding at the beginning for circular effect */}
                {eventCarouselIndex === 0 && remainingEvents.length > ITEMS_PER_VIEW && (
                  <div className="opacity-0 h-0 overflow-hidden">
                    {remainingEvents.slice(-1).map((event, index) => (
                      <div
                        key={`pre-${event.id}-${index}`}
                        className="invisible"
                      />
                    ))}
                  </div>
                )}
                
                {remainingEvents.map((event, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    onClick={() => onEventClick(event)}
                    className={`
                      text-xs p-2 rounded cursor-pointer transition-all mb-2 last:mb-0 h-[34px] overflow-hidden
                      ${getEventTypeColor(event.type)}
                    `}
                  >
                    <span className="block truncate">{event.title}</span>
                    <span className="text-gray-700 truncate text-[10px] mt-0.5 block">
                      {event.type}
                    </span>
                  </div>
                ))}
                
                {/* Add padding at the end for circular effect */}
                {eventCarouselIndex === remainingEvents.length - 1 && remainingEvents.length > ITEMS_PER_VIEW && (
                  <div className="opacity-0 h-0 overflow-hidden">
                    {remainingEvents.slice(0, 1).map((event, index) => (
                      <div
                        key={`post-${event.id}-${index}`}
                        className="invisible"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation dots - now one dot per item */}
            {remainingEvents.length > ITEMS_PER_VIEW && (
              <div className="flex justify-center mt-2 gap-1 overflow-x-auto max-w-full px-2">
                {remainingEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setEventCarouselIndex(index)}
                    className={`h-1.5 rounded-full transition-all flex-shrink-0 ${
                      index === eventCarouselIndex ? 'w-4 bg-gray-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to event item ${index + 1}`}
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