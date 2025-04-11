import { Publication, Event, CalendarDay } from '@/types';

/**
 * Standard date parsing function used throughout the application
 */
export const parseDate = (dateStr: string): Date => {
  if (!dateStr) {
    console.warn('Attempted to parse undefined or empty date string');
    return new Date(); // Default to current date
  }
  
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-based month
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
};

/**
 * Formats a date string (YYYYMMDD) into a readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) {
    return ''; // Return empty string for undefined dates
  }
  
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', { 
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
  if (!dateStr || dateStr.length < 8) {
    console.warn('Invalid date string provided to getWeekNumber:', dateStr);
    return 1; // Default to first week
  }
  
  const day = parseInt(dateStr.substring(6, 8));
  if (isNaN(day)) {
    console.warn('Could not parse day from date string:', dateStr);
    return 1; // Default to first week
  }
  
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
 * Groups publications by institution
 */
export const groupPublicationsByInstitution = (publications: Publication[]) => {
  const groups: Record<string, Publication[]> = {};
  
  publications.forEach(publication => {
    if (!groups[publication.InstitutionName]) {
      groups[publication.InstitutionName] = [];
    }
    groups[publication.InstitutionName].push(publication);
  });
  
  return Object.entries(groups).map(([institution, pubs]) => ({
    institution,
    titles: Array.from(new Set(pubs.map(pub => pub.PublicationTitle)))
  }));
};

/**
 * Gets publications for a specific date
 */
export const getPublicationsForDate = (publications: Publication[], date: string): Publication[] => {
  return publications.filter(pub => pub.ReleaseDate === date);
};

/**
 * Gets events for a specific date
 */
export const getEventsForDate = (events: Event[], date: string): Event[] => {
  return events.filter(event => {
    // Convert all dates to numbers for proper comparison
    const dateNum = parseInt(date);
    const startNum = parseInt(event.ReleaseDate);
    const endNum = event.EventEndDate ? parseInt(event.EventEndDate) : startNum;
    
    return dateNum >= startNum && dateNum <= endNum;
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