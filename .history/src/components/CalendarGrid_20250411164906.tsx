import React, { useMemo } from 'react';
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
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarGrid: React.FC<Props> = ({
  publications,
  events,
  onPublicationClick,
  onEventClick,
  currentYear,
  currentMonth,
  onPreviousMonth,
  onNextMonth
}) => {
  // Use useMemo to avoid unnecessary recalculations when component re-renders
  // but ensure it recalculates when year/month changes
  const days = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);
  
  // Filter events for current month and year - also using useMemo for performance
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Only consider events if they have a valid ReleaseDate
      if (!event.ReleaseDate || event.ReleaseDate.length !== 8) {
        return false;
      }
      
      // Check if the event is in the current month/year
      const eventYear = parseInt(event.ReleaseDate.substring(0, 4));
      const eventMonth = parseInt(event.ReleaseDate.substring(4, 6));
      
      return eventYear === currentYear && eventMonth === currentMonth;
    });
  }, [events, currentYear, currentMonth]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button 
          onClick={onPreviousMonth}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          ← Previous Month
        </button>
        <button 
          onClick={onNextMonth}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          Next Month →
        </button>
      </div>
      
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
            key={`${currentYear}-${currentMonth}-${day.day}`}
            day={day}
            publications={day.date ? getPublicationsForDate(publications, day.date) : []}
            events={day.date ? getEventsForDate(filteredEvents, day.date) : []}
            onPublicationClick={onPublicationClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}; 