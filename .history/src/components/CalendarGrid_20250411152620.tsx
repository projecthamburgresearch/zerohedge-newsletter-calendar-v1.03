import React from 'react';
import { Publication, Event } from '@/types';
import { CalendarCell } from './CalendarCell';
import { getMonthDays, getPublicationsForDate, getEventsForDate, parseDate } from '@/utils/dateUtils';

interface Props {
  publications: Publication[];
  events: Event[];
  onPublicationClick: (publication: Publication) => void;
  onEventClick: (event: Event) => void;
  currentYear: number;
  currentMonth: number;
}

export const CalendarGrid: React.FC<Props> = ({
  publications,
  events,
  onPublicationClick,
  onEventClick,
  currentYear,
  currentMonth
}) => {
  // Filter events for current month and year only once at the parent level
  const filteredEvents = events.filter(event => {
    if (!event.ReleaseDate) return false;
    if (!('EventTitle' in event)) return false;
    
    try {
      const eventDate = parseDate(event.ReleaseDate);
      const eventMonth = eventDate.getMonth() + 1;
      const eventYear = eventDate.getFullYear();
      
      // Check if start date is in current month/year or
      // end date is in current month/year
      if (eventYear === currentYear && eventMonth === currentMonth) return true;
      
      // For multi-day events, also check if the event spans into this month
      if (event.EventEndDate) {
        const endDate = parseDate(event.EventEndDate);
        const endMonth = endDate.getMonth() + 1;
        const endYear = endDate.getFullYear();
        
        // Check if the event overlaps with the current month
        const startBeforeOrInMonth = (eventYear < currentYear) || 
                                    (eventYear === currentYear && eventMonth <= currentMonth);
        const endAfterOrInMonth = (endYear > currentYear) || 
                                  (endYear === currentYear && endMonth >= currentMonth);
        
        if (startBeforeOrInMonth && endAfterOrInMonth) return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error parsing date for event:', event);
      return false;
    }
  });

  const days = getMonthDays(currentYear, currentMonth);

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day Headers */}
      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
        <div key={day} className="p-2 bg-gray-100 text-center font-semibold">
          {day}
        </div>
      ))}

      {/* Calendar Cells */}
      {days.map(day => (
        <CalendarCell
          key={day.date}
          day={day}
          publications={getPublicationsForDate(publications, day.date)}
          events={getEventsForDate(filteredEvents, day.date)}
          onPublicationClick={onPublicationClick}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
}; 