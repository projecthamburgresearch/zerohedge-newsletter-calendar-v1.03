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
  // Get calendar days without empty cells for the month
  const days = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Calculate the day of week for the 1st of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = useMemo(() => {
    const firstDay = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    return firstDay.getUTCDay();
  }, [currentYear, currentMonth]);
  
  // Filter events for current month and year
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

        {/* Calendar Cells - only for actual month days */}
        {days.filter(day => day.isCurrentMonth).map((day, index) => {
          // For the first day of the month, calculate the grid column to start from
          const gridColumnStart = index === 0 ? firstDayOfMonth + 1 : undefined;
          
          return (
            <div 
              key={day.date} 
              style={gridColumnStart ? { gridColumnStart } : undefined}
            >
              <CalendarCell
                day={day}
                publications={getPublicationsForDate(publications, day.date)}
                events={getEventsForDate(filteredEvents, day.date)}
                onPublicationClick={onPublicationClick}
                onEventClick={onEventClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}; 