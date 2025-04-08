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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [eventCarouselIndex, setEventCarouselIndex] = useState(0);
  
  const publicationsTimer = useRef<NodeJS.Timeout>();
  const eventsTimer = useRef<NodeJS.Timeout>();
  const carouselRef = useRef<HTMLDivElement>(null);
  const eventCarouselRef = useRef<HTMLDivElement>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (publicationsTimer.current) clearTimeout(publicationsTimer.current);
      if (eventsTimer.current) clearTimeout(eventsTimer.current);
    };
  }, []);

  // Reset carousel index when hover state changes
  useEffect(() => {
    if (!isPublicationsHovered) {
      setCarouselIndex(0);
    }
    
    if (!isEventAreaHovered) {
      setEventCarouselIndex(0);
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

  // Carousel navigation functions
  const goToNext = () => {
    if (carouselIndex < Math.ceil(remainingPublications.length / 3) - 1) {
      setCarouselIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(prev => prev - 1);
    }
  };
  
  // Event carousel navigation
  const goToEventNext = () => {
    if (eventCarouselIndex < Math.ceil(remainingEvents.length / 3) - 1) {
      setEventCarouselIndex(prev => prev + 1);
    }
  };

  const goToEventPrev = () => {
    if (eventCarouselIndex > 0) {
      setEventCarouselIndex(prev => prev - 1);
    }
  };

  // Edge hover detection for auto-scrolling
  const handleEdgeHover = (direction: 'left' | 'right') => {
    if (direction === 'left' && carouselIndex > 0) {
      goToPrev();
    } else if (direction === 'right' && carouselIndex < Math.ceil(remainingPublications.length / 3) - 1) {
      goToNext();
    }
  };
  
  // Edge hover detection for events auto-scrolling
  const handleEventEdgeHover = (direction: 'left' | 'right') => {
    if (direction === 'left' && eventCarouselIndex > 0) {
      goToEventPrev();
    } else if (direction === 'right' && eventCarouselIndex < Math.ceil(remainingEvents.length / 3) - 1) {
      goToEventNext();
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

        {/* Publications Carousel */}
        {isPublicationsHovered && remainingPublications.length > 0 && (
          <div 
            className="absolute z-20 bottom-full left-0 w-full bg-white shadow-lg rounded p-2 border mb-1"
            onMouseEnter={handlePublicationsMouseEnter}
            onMouseLeave={handlePublicationsMouseLeave}
          >
            {/* Edge hover zones for auto-scrolling */}
            {carouselIndex > 0 && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-6 z-30 bg-gradient-to-r from-white/80 to-transparent flex items-center justify-start cursor-pointer"
                onMouseEnter={() => handleEdgeHover('left')}
                onClick={goToPrev}
              >
                <div className="text-brand-yellow-400 opacity-70 hover:opacity-100">
                  ◄
                </div>
              </div>
            )}
            
            {carouselIndex < Math.ceil(remainingPublications.length / 3) - 1 && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-6 z-30 bg-gradient-to-l from-white/80 to-transparent flex items-center justify-end cursor-pointer"
                onMouseEnter={() => handleEdgeHover('right')}
                onClick={goToNext}
              >
                <div className="text-brand-yellow-400 opacity-70 hover:opacity-100">
                  ►
                </div>
              </div>
            )}
            
            {/* Carousel container */}
            <div className="relative overflow-hidden">
              <div 
                ref={carouselRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {/* Group publications into sets of 3 */}
                {Array.from({ length: Math.ceil(remainingPublications.length / 3) }).map((_, pageIndex) => (
                  <div key={pageIndex} className="flex w-full min-w-full gap-2">
                    {remainingPublications.slice(pageIndex * 3, pageIndex * 3 + 3).map((pub, index) => (
                      <div
                        key={`${pub.source}-${pub.seriesTitle}-${pageIndex}-${index}`}
                        onClick={() => onPublicationClick(pub)}
                        className="text-xs p-2 rounded cursor-pointer hover:bg-brand-yellow-100 flex-1 transition-all"
                      >
                        <span className="font-semibold block truncate">{pub.source}</span>
                        <span className="text-gray-600 line-clamp-2 text-[10px] mt-1">{pub.seriesTitle}</span>
                      </div>
                    ))}
                    {/* Add empty placeholders if less than 3 items on this page */}
                    {remainingPublications.length % 3 > 0 && 
                     pageIndex === Math.ceil(remainingPublications.length / 3) - 1 && 
                     Array.from({ length: 3 - (remainingPublications.length % 3) }).map((_, i) => (
                      <div key={`placeholder-${i}`} className="flex-1" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation dots */}
            {Math.ceil(remainingPublications.length / 3) > 1 && (
              <div className="flex justify-center mt-2 gap-1">
                {Array.from({ length: Math.ceil(remainingPublications.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCarouselIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === carouselIndex ? 'w-4 bg-brand-yellow-300' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to page ${index + 1}`}
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
                className="absolute left-0 top-0 bottom-0 w-6 z-30 bg-gradient-to-r from-white/80 to-transparent flex items-center justify-start cursor-pointer"
                onMouseEnter={() => handleEventEdgeHover('left')}
                onClick={goToEventPrev}
              >
                <div className="text-gray-500 opacity-70 hover:opacity-100">
                  ◄
                </div>
              </div>
            )}
            
            {eventCarouselIndex < Math.ceil(remainingEvents.length / 3) - 1 && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-6 z-30 bg-gradient-to-l from-white/80 to-transparent flex items-center justify-end cursor-pointer"
                onMouseEnter={() => handleEventEdgeHover('right')}
                onClick={goToEventNext}
              >
                <div className="text-gray-500 opacity-70 hover:opacity-100">
                  ►
                </div>
              </div>
            )}
            
            {/* Carousel container */}
            <div className="relative overflow-hidden">
              <div 
                ref={eventCarouselRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${eventCarouselIndex * 100}%)` }}
              >
                {/* Group events into sets of 3 */}
                {Array.from({ length: Math.ceil(remainingEvents.length / 3) }).map((_, pageIndex) => (
                  <div key={pageIndex} className="flex w-full min-w-full gap-2">
                    {remainingEvents.slice(pageIndex * 3, pageIndex * 3 + 3).map((event, index) => (
                      <div
                        key={`${event.id}-${pageIndex}-${index}`}
                        onClick={() => onEventClick(event)}
                        className={`
                          text-xs p-2 rounded cursor-pointer flex-1 transition-all
                          ${getEventTypeColor(event.type)}
                        `}
                      >
                        <span className="block truncate">{event.title}</span>
                        <span className="text-gray-600 text-[10px] mt-1 block">
                          {event.type}
                        </span>
                      </div>
                    ))}
                    {/* Add empty placeholders if less than 3 items on this page */}
                    {remainingEvents.length % 3 > 0 && 
                     pageIndex === Math.ceil(remainingEvents.length / 3) - 1 && 
                     Array.from({ length: 3 - (remainingEvents.length % 3) }).map((_, i) => (
                      <div key={`event-placeholder-${i}`} className="flex-1" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation dots */}
            {Math.ceil(remainingEvents.length / 3) > 1 && (
              <div className="flex justify-center mt-2 gap-1">
                {Array.from({ length: Math.ceil(remainingEvents.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setEventCarouselIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === eventCarouselIndex ? 'w-4 bg-gray-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to event page ${index + 1}`}
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