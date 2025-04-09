import { Publication, Event } from '@/types';
import { CalendarCell } from './CalendarCell';
import { getMonthDays, getPublicationsForDate, getEventsForDate } from '@/utils/dateUtils';

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
  // Filter events for current month and year
  const filteredEvents = events.filter(event => {
    // Extract year and month directly from the string to avoid Date object month conversion issues
    const eventYear = parseInt(event.startDate.substring(0, 4));
    const eventMonth = parseInt(event.startDate.substring(4, 6)); // Already in 1-based format
    
    return eventYear === currentYear && eventMonth === currentMonth;
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