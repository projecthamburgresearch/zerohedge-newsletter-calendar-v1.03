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
  const [pubCanScroll, setPubCanScroll] = useState(false);
  const [eventCanScroll, setEventCanScroll] = useState(false);
  const [pubScrollTop, setPubScrollTop] = useState(0);
  const [eventScrollTop, setEventScrollTop] = useState(0);
  
  const publicationsTimer = useRef<NodeJS.Timeout>();
  const eventsTimer = useRef<NodeJS.Timeout>();
  const pubScrollInterval = useRef<number>();
  const eventScrollInterval = useRef<number>();
  const pubListRef = useRef<HTMLDivElement>(null);
  const eventListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (publicationsTimer.current) clearTimeout(publicationsTimer.current);
      if (eventsTimer.current) clearTimeout(eventsTimer.current);
      stopPubScroll();
      stopEventScroll();
    };
  }, []);

  useEffect(() => {
    if (!isPublicationsHovered) {
      stopPubScroll();
      setPubScrollTop(0);
      if (pubListRef.current) pubListRef.current.scrollTop = 0;
    } else {
      updatePubScrollState();
    }
  }, [isPublicationsHovered]);

  useEffect(() => {
    if (!isEventAreaHovered) {
      stopEventScroll();
      setEventScrollTop(0);
      if (eventListRef.current) eventListRef.current.scrollTop = 0;
    } else {
      updateEventScrollState();
    }
  }, [isEventAreaHovered]);

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

  const startScroll = (listRef: React.RefObject<HTMLDivElement>, direction: 'up' | 'down', intervalRef: React.MutableRefObject<number | undefined>) => {
    stopScroll(intervalRef);
    const scrollStep = 6;

    const scroll = () => {
      if (listRef.current) {
        const currentScroll = listRef.current.scrollTop;
        const maxScroll = listRef.current.scrollHeight - listRef.current.clientHeight;
        let nextScroll;

        if (direction === 'down') {
          nextScroll = Math.min(currentScroll + scrollStep, maxScroll);
          if (nextScroll >= maxScroll) stopScroll(intervalRef);
        } else {
          nextScroll = Math.max(currentScroll - scrollStep, 0);
          if (nextScroll <= 0) stopScroll(intervalRef);
        }
        listRef.current.scrollTop = nextScroll;
      }
      if (intervalRef.current) {
        intervalRef.current = requestAnimationFrame(scroll);
      }
    };
    intervalRef.current = requestAnimationFrame(scroll);
  };

  const stopScroll = (intervalRef: React.MutableRefObject<number | undefined>) => {
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  const startPubScroll = (direction: 'up' | 'down') => startScroll(pubListRef, direction, pubScrollInterval);
  const stopPubScroll = () => stopScroll(pubScrollInterval);
  const startEventScroll = (direction: 'up' | 'down') => startScroll(eventListRef, direction, eventScrollInterval);
  const stopEventScroll = () => stopScroll(eventScrollInterval);

  const updatePubScrollState = () => {
    if (pubListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = pubListRef.current;
      setPubScrollTop(scrollTop);
      setPubCanScroll(scrollHeight > clientHeight + 1);
    }
  };
  
  const updateEventScrollState = () => {
    if (eventListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = eventListRef.current;
      setEventScrollTop(scrollTop);
      setEventCanScroll(scrollHeight > clientHeight + 1);
    }
  };

  const handlePubClick = (pub: Publication) => {
    onPublicationClick(pub);
    setIsPublicationsHovered(false);
  };

  const handleEventClick = (event: Event) => {
    onEventClick(event);
    setIsEventAreaHovered(false);
  };

  if (day.isEmpty) {
    return <div className="p-2 bg-gray-50 h-[100px]" />;
  }

  const visiblePublications = publications.slice(0, 2);
  const remainingPublications = publications.slice(2);
  const currentEvent = events[0];
  const remainingEvents = events.slice(1);
  const isCurrentDay = day.date === new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const showPubUpArrow = pubCanScroll && pubScrollTop > 0;
  const showPubDownArrow = pubCanScroll && pubListRef.current && 
    pubScrollTop < (pubListRef.current.scrollHeight - pubListRef.current.clientHeight - 1);
  const showEventUpArrow = eventCanScroll && eventScrollTop > 0;
  const showEventDownArrow = eventCanScroll && eventListRef.current && 
    eventScrollTop < (eventListRef.current.scrollHeight - eventListRef.current.clientHeight - 1);
    
  const showPubScrollControls = remainingPublications.length > 3;
  const showEventScrollControls = remainingEvents.length > 3;

  return (
    <div className={`p-2 border ${isCurrentDay ? 'bg-brand-yellow-50' : 'bg-white'} h-[100px] relative hover:shadow-lg transition-shadow`}>
      <div className="text-right text-gray-600 mb-1">{day.day}</div>

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
            className="absolute z-20 bottom-full left-0 w-full bg-white shadow-lg rounded border mb-1 p-1"
            onMouseEnter={handlePublicationsMouseEnter}
            onMouseLeave={handlePublicationsMouseLeave}
          >
            <div className="relative">
              {/* Up Arrow - always visible when there's content to scroll, with "disabled" appearance when can't scroll up */}
              {showPubScrollControls && (
                <button 
                  className={`sticky top-0 w-full bg-slate-100 rounded-md text-black font-bold py-0.2 text-xs border-b border-gray-200 flex justify-center items-center z-10 hover:bg-slate-200 ${!showPubUpArrow ? 'opacity-50' : ''}`}
                  onMouseEnter={() => startPubScroll('up')}
                  onMouseLeave={stopPubScroll}
                >
                  ▲
                </button>
              )}

              {/* Scrollable List Container */}
              <div 
                ref={pubListRef}
                className={`overflow-y-auto ${remainingPublications.length > 4 ? 'h-[160px]' : ''} ${showPubScrollControls ? 'pt-0 pb-5' : ''}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={updatePubScrollState}
              >
                <style>{`div[data-pub-list="true"]::-webkit-scrollbar { display: none; }`}</style>
                
                <div className="space-y-1 px-1" data-pub-list="true">
                  {remainingPublications.map((pub, index) => (
                    <div
                      key={`pub-${index}`}
                      onClick={() => handlePubClick(pub)}
                      className="group text-xs p-2 rounded cursor-pointer hover:bg-brand-yellow-100"
                    >
                      <div className="font-semibold">{pub.source}</div>
                      <div className="text-gray-600 mt-1 h-0 overflow-hidden opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-200">
                        {pub.seriesTitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Down Arrow - always visible when there's content to scroll, with "disabled" appearance when can't scroll down */}
              {showPubScrollControls && (
                <button 
                  className={`sticky bottom-0 w-full bg-slate-100 text-black font-bold py-0.2 text-xs shadow-md rounded-md border-t border-gray-200 flex justify-center items-center z-10 hover:bg-slate-200 ${!showPubDownArrow ? 'opacity-50' : ''}`}
                  onMouseEnter={() => startPubScroll('down')}
                  onMouseLeave={stopPubScroll}
                >
                  ▼
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {remainingPublications.length > 0 && (
        <div className="absolute top-2 right-2 bg-brand-yellow-200 rounded-full w-5 h-5 flex items-center justify-center text-xs">
          +{remainingPublications.length}
        </div>
      )}
          
      <div
        className="absolute bottom-2 left-2 right-2"
        onMouseEnter={handleEventAreaMouseEnter}
        onMouseLeave={handleEventAreaMouseLeave}
      >
        {currentEvent && (
          <div
            onClick={() => handleEventClick(currentEvent)}
            className={`text-xs p-1 rounded cursor-pointer whitespace-nowrap overflow-hidden ${getEventTypeColor(currentEvent.type)}`}
            title={currentEvent.title}
          >
            <span className="inline-block truncate w-[calc(100%-20px)]">{currentEvent.title}</span>
            {remainingEvents.length > 0 && (
              <span className="inline-block w-4 text-center ml-1">+{remainingEvents.length}</span>
            )}
          </div>
        )}

        {/* Events Menu */}
        {isEventAreaHovered && remainingEvents.length > 0 && (
          <div 
            className="absolute z-20 top-full left-0 w-full bg-white shadow-lg rounded border mt-1 p-1"
            onMouseEnter={handleEventAreaMouseEnter}
            onMouseLeave={handleEventAreaMouseLeave}
          >
            <div className="relative">
              {/* Up Arrow - always visible when there's content to scroll, with "disabled" appearance when can't scroll up */}
              {showEventScrollControls && (
                <button 
                  className={`sticky top-0 w-full bg-gray-100 text-black font-bold py-0.5 text-xs border-b border-gray-200 flex justify-center items-center z-10 hover:bg-gray-200 ${!showEventUpArrow ? 'opacity-50' : ''}`}
                  onMouseEnter={() => startEventScroll('up')}
                  onMouseLeave={stopEventScroll}
                >
                  ▲
                </button>
              )}

              {/* Scrollable List Container */}
              <div 
                ref={eventListRef}
                className={`overflow-y-auto ${remainingEvents.length > 4 ? 'h-[160px]' : ''} ${showEventScrollControls ? 'pt-0 pb-5' : ''}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={updateEventScrollState}
              >
                <style>{`div[data-event-list="true"]::-webkit-scrollbar { display: none; }`}</style>
                
                <div className="space-y-1 px-1" data-event-list="true">
                  {remainingEvents.map((event, index) => (
                    <div
                      key={`event-${index}`}
                      onClick={() => handleEventClick(event)}
                      className={`group text-xs p-2 rounded cursor-pointer ${getEventTypeColor(event.type)}`}
                    >
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-gray-600 mt-1 h-0 overflow-hidden opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-200">
                        {event.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Down Arrow - always visible when there's content to scroll, with "disabled" appearance when can't scroll down */}
              {showEventScrollControls && (
                <button 
                  className={`sticky bottom-0 w-full bg-gray-100 text-black font-bold py-0.5 text-xs border-t border-gray-200 flex justify-center items-center z-10 hover:bg-gray-200 ${!showEventDownArrow ? 'opacity-50' : ''}`}
                  onMouseEnter={() => startEventScroll('down')}
                  onMouseLeave={stopEventScroll}
                >
                  ▼
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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