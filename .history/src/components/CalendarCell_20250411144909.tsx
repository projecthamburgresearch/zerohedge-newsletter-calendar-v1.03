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
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPublications, setShowPublications] = useState(true);
  const cellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter publications and events for this day
  const dayPublications = publications.filter(pub => {
    if (!pub.ReleaseDate) return false;
    const pubDate = pub.ReleaseDate;
    return pubDate.substring(0, 8) === day.date.replace(/-/g, '');
  });

  const dayEvents = events.filter(event => {
    if (!event.ReleaseDate) return false;
    const eventDate = event.ReleaseDate;
    const eventEndDate = event.EventEndDate || event.ReleaseDate;
    const formattedDate = day.date.replace(/-/g, '');
    
    // Check if the day is within the event range
    return eventDate <= formattedDate && eventEndDate >= formattedDate;
  });

  // Sort and limit visible publications
  const sortedPublications = [...dayPublications].sort((a, b) => 
    a.InstitutionName.localeCompare(b.InstitutionName)
  );
  
  // Group publications by source
  const pubGroups = groupPublicationsBySource(sortedPublications);
  
  const MAX_VISIBLE = 3;
  const visiblePublications = sortedPublications.slice(0, MAX_VISIBLE);
  const remainingPublications = sortedPublications.slice(MAX_VISIBLE);

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Handle publication click, making sure it doesn't trigger cell click
   */
  const handlePubClick = (pub: Publication) => {
    if (onPublicationClick) {
      onPublicationClick(pub);
    }
  };

  /**
   * Handle event click, making sure it doesn't trigger cell click
   */
  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  /**
   * Render source groups in dropdown menu
   */
  const renderSourceGroups = () => {
    if (pubGroups.length === 0) return null;
    
    return (
      <div className="py-2">
        <div className="text-xs font-semibold text-gray-700 px-3 pb-1">Publications by Source</div>
        {pubGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-2">
            <div className="text-xs font-semibold px-3 py-1 bg-gray-100">
              {group.source}
            </div>
            <div className="py-1">
              {group.titles.map((title, titleIdx) => {
                const publication = sortedPublications.find(p => 
                  p.InstitutionName === group.source && p.PublicationTitle === title
                );
                
                if (!publication) return null;
                
                return (
                  <div
                    key={titleIdx}
                    className="px-3 py-1 text-xs hover:bg-yellow-100 cursor-pointer"
                    onClick={() => {
                      handlePubClick(publication);
                      setIsMenuOpen(false);
                    }}
                  >
                    {title}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      ref={cellRef}
      className={`relative border border-gray-200 p-1 min-h-[100px] ${
        day.isEmpty ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      {/* Day number */}
      <div className="flex justify-between items-center mb-1">
        <div className={`text-sm font-medium ${day.isEmpty ? 'text-gray-400' : 'text-gray-700'}`}>
          {day.day}
        </div>
        {(dayPublications.length > 0 || dayEvents.length > 0) && !day.isEmpty && (
          <button 
            className="text-xs text-gray-500 hover:text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            •••
          </button>
        )}
      </div>
      
      {!day.isEmpty && (
        <div className="space-y-1">
          {/* Events */}
          {dayEvents.map(event => (
            <div
              key={event.EventIdentifier}
              onClick={() => handleEventClick(event)}
              className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
              title={event.EventTitle}
            >
              {event.EventTitle}
            </div>
          ))}
          
          {/* Publications */}
          {visiblePublications.map((pub, index) => (
            <div
              key={`${pub.InstitutionName}-${pub.PublicationTitle}-${index}`}
              onClick={() => handlePubClick(pub)}
              className="text-xs p-1 bg-brand-yellow-100 rounded cursor-pointer hover:bg-brand-yellow-200 whitespace-nowrap overflow-hidden flex items-center justify-between"
              title={`${pub.InstitutionName} - ${pub.PublicationTitle}`}
            >
              <div className="flex-1 overflow-hidden pr-1 marquee-text">
                <div className="inline-flex scrollable-text">
                  <span className="font-semibold whitespace-nowrap">{getAbbreviatedSource(pub.InstitutionName)}</span>
                  <span className="mx-1 whitespace-nowrap">-</span>
                  <span className="whitespace-nowrap">{pub.PublicationTitle}</span>
                </div>
              </div>
              {index === 0 && remainingPublications.length > 0 && (
                <span className="whitespace-nowrap flex-shrink-0 ml-1 font-semibold shadow-md rounded-md bg-yellow-400 px-1">+{remainingPublications.length}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Publications Menu */}
      {isMenuOpen && !day.isEmpty && (
        <div
          ref={menuRef}
          className="absolute z-10 left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 w-64"
          style={{ top: '100%' }}
        >
          <div className="flex justify-between items-center p-2 border-b">
            <div className="text-sm font-medium">{day.date}</div>
            <button className="text-gray-400 hover:text-gray-600" onClick={() => setIsMenuOpen(false)}>
              ✕
            </button>
          </div>
          
          {renderSourceGroups()}
          
          {dayEvents.length > 0 && (
            <div className="py-2 border-t">
              <div className="text-xs font-semibold text-gray-700 px-3 pb-1">Economic Events</div>
              {dayEvents.map(event => (
                <div
                  key={event.EventIdentifier}
                  className="px-3 py-1 text-xs hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    handleEventClick(event);
                    setIsMenuOpen(false);
                  }}
                >
                  {event.EventTitle}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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