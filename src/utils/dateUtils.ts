import { Publication, Event, CalendarDay } from '@/types';

/**
 * Formats a date string (YYYYMMDD) into a readable format
 */
export const formatDate = (dateString: string): string => {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    .toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
};

/**
 * Gets the abbreviated source name
 */
export const getAbbreviatedSource = (source: string): string => {
  const abbreviations: Record<string, string> = {
    'Morgan Stanley': 'MS',
    'Goldman': 'GS',
    'JPMorgan': 'JPM',
    'JPM': 'JPM',
    'SocGen': 'SG',
    'BofA': 'BAC',
    'Citi': 'C',
    'Barclays': 'BARC',
    'Credit Agricole': 'ACA',
    'MUFG': 'MUFG'
  };
  
  return abbreviations[source] || source;
};

/**
 * Gets all days in a month
 */
export const getMonthDays = (year: number, month: number): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const TOTAL_CELLS = 42; // 6 rows × 7 columns
  
  // Create a date for the first of the month
  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0);
  
  const daysInMonth = lastOfMonth.getDate();
  const firstDayOfWeek = firstOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // First, add empty days for the days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({
      date: '',
      day: 0,
      dayOfWeek: '',
      isEmpty: true
    });
  }
  
  // Then add all the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    days.push({
      date: dateString,
      day: day,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      isEmpty: false
    });
  }
  
  // Fill the remaining cells to complete the 6x7 grid
  const remainingCells = TOTAL_CELLS - days.length;
  for (let i = 0; i < remainingCells; i++) {
    days.push({
      date: '',
      day: 0,
      dayOfWeek: '',
      isEmpty: true
    });
  }
  
  return days;
};

/**
 * Gets the week number for a given date
 */
export const getWeekNumber = (dateStr: string): number => {
  const day = parseInt(dateStr.substring(6, 8));
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
};

/**
 * Gets the month name
 */
export const getMonthName = (month: number): string => {
  return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
};

/**
 * Gets week options for a given month
 */
export const getWeekOptions = (year: number, month: number) => {
  const days = getMonthDays(year, month);
  const weeks = new Set<number>();

  days.forEach(day => {
    if (!day.isEmpty) {
      const weekNum = getWeekNumber(day.date);
      weeks.add(weekNum);
    }
  });

  return Array.from(weeks).sort((a, b) => a - b).map(week => ({
    value: week.toString(),
    label: `Week ${week}`
  }));
};

/**
 * Gets the date range for a week in a month
 */
export const getWeekDateRange = (year: number, month: number, weekNum: number): string => {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeek = firstDayOfMonth.getDay();
  const startDay = (weekNum - 1) * 7 - firstDayWeek + 1;
  const endDay = Math.min(startDay + 6, new Date(year, month + 1, 0).getDate());
  
  const startDate = new Date(year, month, startDay);
  const endDate = new Date(year, month, endDay);
  
  return `${startDate.getDate()}-${endDate.getDate()}`;
};

/**
 * Groups publications by source
 */
export const groupPublicationsBySource = (publications: Publication[]) => {
  const groups: Record<string, Publication[]> = {};
  
  publications.forEach(publication => {
    if (!groups[publication.source]) {
      groups[publication.source] = [];
    }
    groups[publication.source].push(publication);
  });
  
  return Object.entries(groups).map(([source, pubs]) => ({
    source,
    titles: Array.from(new Set(pubs.map(pub => pub.seriesTitle)))
  }));
};

/**
 * Gets publications for a specific date
 */
export const getPublicationsForDate = (publications: Publication[], date: string): Publication[] => {
  return publications.filter(pub => pub.date === date);
};

/**
 * Gets events for a specific date
 */
export const getEventsForDate = (events: Event[], date: string): Event[] => {
  return events.filter(event => {
    // Convert all dates to numbers for proper comparison
    const eventStart = event.startDate ? parseInt(event.startDate) : 0;
    const eventEnd = event.endDate ? parseInt(event.endDate) : 0;
    const currentDate = parseInt(date);
    return currentDate >= eventStart && currentDate <= eventEnd;
  });
};

/**
 * Gets day options for filtering
 */
export const getDayOptions = () => {
  return [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];
};