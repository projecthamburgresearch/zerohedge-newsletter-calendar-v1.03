import { Publication, Event, CalendarDay } from '@/types';

/**
 * Standard date parsing function used throughout the application
 */
export const parseDate = (dateStr: string): Date => {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-based month
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
};

/**
 * Generates day options for filtering
 */
export const getDayOptions = (): { value: string; label: string; }[] => {
  return [
    { value: "", label: "All Days" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" }
  ];
};

/**
 * Generates week options for filtering
 */
export const getWeekOptions = (year: number, month: number): { value: string; label: string; }[] => {
  const weeksInMonth = getWeeksInMonth(year, month);
  const options = [{ value: "", label: "All Weeks" }];

  for (let i = 1; i <= weeksInMonth; i++) {
    options.push({ value: i.toString(), label: `Week ${i}` });
  }

  return options;
};

/**
 * Calculates the number of weeks in a month
 */
function getWeeksInMonth(year: number, month: number): number {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  return Math.ceil((firstDay + daysInMonth) / 7);
}

/**
 * Generates month days for a specific month
 */
export const getMonthDays = (year: number, month: number): CalendarDay[] => {
  const days: CalendarDay[] = [];
  
  // Get the first day of the month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  
  // Get the number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Add empty days for the days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ date: '', day: 0, dayOfWeek: '', isCurrentMonth: false });
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${year}${month.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month - 1, i).toLocaleDateString('en-US', { weekday: 'long' });
    days.push({ date, day: i, dayOfWeek, isCurrentMonth: true });
  }
  
  return days;
};

/**
 * Formats date for display
 */
export const formatDate = (dateStr: string): string => {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${month}/${day}/${year}`;
};

/**
 * Gets abbreviated source name
 */
export const getAbbreviatedSource = (institutionName: string): string => {
  const abbreviations: Record<string, string> = {
    'Morgan Stanley': 'MS',
    'Goldman': 'GS',
    'JPMorgan': 'JPM',
    'JPM': 'JPM',
    'SocGen': 'SG',
    'BofA': 'BofA',
    'Barclays': 'BARC',
    'Citi': 'C',
    'Credit Suisse': 'CS',
    'Deutsche Bank': 'DB',
    'UBS': 'UBS'
  };
  
  return abbreviations[institutionName] || institutionName;
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
    if (!groups[publication.InstitutionName]) {
      groups[publication.InstitutionName] = [];
    }
    groups[publication.InstitutionName].push(publication);
  });
  
  return Object.entries(groups).map(([source, pubs]) => ({
    source,
    titles: Array.from(new Set(pubs.map(pub => pub.PublicationTitle)))
  }));
};