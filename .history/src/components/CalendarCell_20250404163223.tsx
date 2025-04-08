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
      setPubActiveIndex(0);
      if (pubScrollTimer.current) {
        clearTimeout(pubScrollTimer.current);
        pubScrollTimer.current = undefined;
      }
    }
    
    if (!isEventAreaHovered) {
      setEventActiveIndex(0);
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

  // Publication carousel navigation
  const scrollPubTo = (index: number) => {
    if (index >= 0 && index < remainingPublications.length) {
      setPubActiveIndex(index);
    }
  };

  // Event carousel navigation
  const scrollEventTo = (index: number) => {
    if (index >= 0 && index < remainingEvents.length) {
      setEventActiveIndex(index);
    }
  };

  // Continuous scrolling for publications
  const startPubAutoScroll = (direction: 'up' | 'down') => {
    if (pubScrollTimer.current) {
      clearTimeout(pubScrollTimer.current);
    }
    
    const scroll = () => {
      let nextIndex;
      if (direction === 'up') {
        nextIndex = pubActiveIndex - 1;
      } else {
        nextIndex = pubActiveIndex + 1;
      }
      
      if (nextIndex >= 0 && nextIndex < remainingPublications.length) {
        setPubActiveIndex(nextIndex);
        pubScrollTimer.current = setTimeout(scroll, 1000);
      }
    };
    
    pubScrollTimer.current = setTimeout(scroll, 500);
  };

  // Stop publication auto-scrolling
  const stopPubAutoScroll = () => {
    if (pubScrollTimer.current) {
      clearTimeout(pubScrollTimer.current);
      pubScrollTimer.current = undefined;
    }
  };

  // Continuous scrolling for events
  const startEventAutoScroll = (direction: 'up' | 'down') => {
    if (eventScrollTimer.current) {
      clearTimeout(eventScrollTimer.current);
    }
    
    const scroll = () => {
      let nextIndex;
      if (direction === 'up') {
        nextIndex = eventActiveIndex - 1;
      } else {
        nextIndex = eventActiveIndex + 1;
      }
      
      if (nextIndex >= 0 && nextIndex < remainingEvents.length) {
        setEventActiveIndex(nextIndex);
        eventScrollTimer.current = setTimeout(scroll, 1000);
      }
    };
    
    eventScrollTimer.current = setTimeout(scroll, 500);
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

  // Helper function to get visible items for 3D carousel
  const getVisibleItems = (items: any[], activeIndex: number, count: number = 3) => {
    if (items.length <= count) return items;
    
    const halfCount = Math.floor(count / 2);
    let start = activeIndex - halfCount;
    
    // Adjust start if needed to always show "count" items
    if (start < 0) start = 0;
    if (start + count > items.length) start = items.length - count;
    
    return items.slice(start, start + count);
  };

  // Get items for each carousel
  const visiblePubItems = getVisibleItems(remainingPublications, pubActiveIndex);
  const visibleEventItems = getVisibleItems(remainingEvents, eventActiveIndex);

  // Calculate which item should be active in the visible set
  const pubActiveVisibleIndex = Math.min(pubActiveIndex, visiblePubItems.length - 1);
  const eventActiveVisibleIndex = Math.min(eventActiveIndex, visibleEventItems.length - 1);

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

        {/* Publications 3D Carousel */}
        {isPublicationsHovered && remainingPublications.length > 0 && (
          <div 
            className="absolute z-20 bottom-full left-0 w-full bg-white shadow-lg rounded p-2 border mb-1"
            onMouseEnter={handlePublicationsMouseEnter}
            onMouseLeave={handlePublicationsMouseLeave}
            style={{ perspective: '1000px' }}
          >
            {/* Navigation arrows */}
            {pubActiveIndex > 0 && (
              <button 
                className="absolute top-1/2 left-2 z-50 -translate-y-1/2 text-brand-yellow-400 hover:text-brand-yellow-500 focus:outline-none"
                onClick={() => scrollPubTo(pubActiveIndex - 1)}
                aria-label="Previous publication"
              >
                ▲
              </button>
            )}
            
            {pubActiveIndex < remainingPublications.length - 1 && (
              <button 
                className="absolute top-1/2 right-2 z-50 -translate-y-1/2 text-brand-yellow-400 hover:text-brand-yellow-500 focus:outline-none"
                onClick={() => scrollPubTo(pubActiveIndex + 1)}
                aria-label="Next publication"
              >
                ▼
              </button>
            )}
            
            {/* 3D Carousel container */}
            <div className="relative overflow-hidden h-[150px] mx-6">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {visiblePubItems.map((pub, index) => {
                  // Calculate position and style based on distance from active item
                  const distance = index - pubActiveVisibleIndex;
                  const isActive = distance === 0;
                  const zIndex = 10 - Math.abs(distance);
                  
                  // 3D transform effect
                  let transform = 'translateY(0)';
                  let opacity = 1;
                  let scale = 1;
                  
                  if (distance < 0) {
                    // Items above active
                    transform = `translateY(-${Math.abs(distance) * 35}px) scale(${0.9 - Math.abs(distance) * 0.1}) translateZ(-${Math.abs(distance) * 20}px)`;
                    opacity = 0.7 - Math.abs(distance) * 0.1;
                  } else if (distance > 0) {
                    // Items below active
                    transform = `translateY(${distance * 35}px) scale(${0.9 - Math.abs(distance) * 0.1}) translateZ(-${Math.abs(distance) * 20}px)`;
                    opacity = 0.7 - Math.abs(distance) * 0.1;
                  } else {
                    // Active item
                    transform = 'translateY(0) scale(1) translateZ(0)';
                    opacity = 1;
                    scale = 1;
                  }
                  
                  return (
                    <div
                      key={`${pub.source}-${pub.seriesTitle}-${index}`}
                      className={`
                        absolute w-full text-xs p-3 rounded cursor-pointer 
                        ${isActive ? 'bg-brand-yellow-100' : 'bg-white'} 
                        transition-all duration-300 ease-in-out
                        hover:bg-brand-yellow-50
                      `}
                      style={{ 
                        transform,
                        opacity,
                        zIndex,
                      }}
                      onClick={() => {
                        if (isActive) {
                          onPublicationClick(pub);
                        } else {
                          scrollPubTo(pubActiveIndex + distance);
                        }
                      }}
                      onMouseEnter={() => {
                        if (distance < 0) startPubAutoScroll('up');
                        if (distance > 0) startPubAutoScroll('down');
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
                      <div className={`mt-1 line-clamp-2 ${isActive ? 'text-gray-800' : 'text-gray-600'} text-[10px]`}>
                        {pub.seriesTitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Navigation dots */}
            {remainingPublications.length > 1 && (
              <div className="flex justify-center mt-1 gap-1">
                {Array.from({ length: Math.min(5, remainingPublications.length) }).map((_, index) => {
                  // Show dots for current position and nearby positions
                  const dotPosition = Math.min(
                    Math.max(0, pubActiveIndex - 2 + index),
                    remainingPublications.length - 1
                  );
                  
                  return (
                    <button
                      key={index}
                      onClick={() => scrollPubTo(dotPosition)}
                      className={`h-1.5 rounded-full transition-all ${
                        dotPosition === pubActiveIndex 
                          ? 'w-4 bg-brand-yellow-300' 
                          : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to publication ${dotPosition + 1}`}
                    />
                  );
                })}
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

        {/* Events 3D Carousel */}
        {isEventAreaHovered && remainingEvents.length > 0 && (
          <div 
            className="absolute z-20 top-full left-0 w-full bg-white shadow-lg rounded p-2 border mt-1"
            onMouseEnter={handleEventAreaMouseEnter}
            onMouseLeave={handleEventAreaMouseLeave}
            style={{ perspective: '1000px' }}
          >
            {/* Navigation arrows */}
            {eventActiveIndex > 0 && (
              <button 
                className="absolute top-1/2 left-2 z-50 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => scrollEventTo(eventActiveIndex - 1)}
                aria-label="Previous event"
              >
                ▲
              </button>
            )}
            
            {eventActiveIndex < remainingEvents.length - 1 && (
              <button 
                className="absolute top-1/2 right-2 z-50 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => scrollEventTo(eventActiveIndex + 1)}
                aria-label="Next event"
              >
                ▼
              </button>
            )}
            
            {/* 3D Carousel container */}
            <div className="relative overflow-hidden h-[150px] mx-6">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {visibleEventItems.map((event, index) => {
                  // Calculate position and style based on distance from active item
                  const distance = index - eventActiveVisibleIndex;
                  const isActive = distance === 0;
                  const zIndex = 10 - Math.abs(distance);
                  
                  // 3D transform effect
                  let transform = 'translateY(0)';
                  let opacity = 1;
                  let scale = 1;
                  
                  if (distance < 0) {
                    // Items above active
                    transform = `translateY(-${Math.abs(distance) * 35}px) scale(${0.9 - Math.abs(distance) * 0.1}) translateZ(-${Math.abs(distance) * 20}px)`;
                    opacity = 0.7 - Math.abs(distance) * 0.1;
                  } else if (distance > 0) {
                    // Items below active
                    transform = `translateY(${distance * 35}px) scale(${0.9 - Math.abs(distance) * 0.1}) translateZ(-${Math.abs(distance) * 20}px)`;
                    opacity = 0.7 - Math.abs(distance) * 0.1;
                  } else {
                    // Active item
                    transform = 'translateY(0) scale(1) translateZ(0)';
                    opacity = 1;
                    scale = 1;
                  }
                  
                  return (
                    <div
                      key={`${event.id}-${index}`}
                      className={`
                        absolute w-full text-xs p-3 rounded cursor-pointer 
                        transition-all duration-300 ease-in-out
                        ${isActive ? getEventTypeColor(event.type) : 'bg-white hover:bg-gray-50'}
                      `}
                      style={{ 
                        transform,
                        opacity,
                        zIndex,
                      }}
                      onClick={() => {
                        if (isActive) {
                          onEventClick(event);
                        } else {
                          scrollEventTo(eventActiveIndex + distance);
                        }
                      }}
                      onMouseEnter={() => {
                        if (distance < 0) startEventAutoScroll('up');
                        if (distance > 0) startEventAutoScroll('down');
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
                      <div className={`mt-1 line-clamp-2 ${isActive ? 'text-gray-700' : 'text-gray-500'} text-[10px]`}>
                        {event.description || ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Navigation dots */}
            {remainingEvents.length > 1 && (
              <div className="flex justify-center mt-1 gap-1">
                {Array.from({ length: Math.min(5, remainingEvents.length) }).map((_, index) => {
                  // Show dots for current position and nearby positions
                  const dotPosition = Math.min(
                    Math.max(0, eventActiveIndex - 2 + index),
                    remainingEvents.length - 1
                  );
                  
                  return (
                    <button
                      key={index}
                      onClick={() => scrollEventTo(dotPosition)}
                      className={`h-1.5 rounded-full transition-all ${
                        dotPosition === eventActiveIndex 
                          ? 'w-4 bg-gray-500' 
                          : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to event ${dotPosition + 1}`}
                    />
                  );
                })}
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