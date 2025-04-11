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
  
  // Get the first day of the month (0-indexed day of week)
  const firstDay = new Date(year, month - 1, 1).getDay();
  
  // Get the number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Add empty days for the days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: '', day: 0, dayOfWeek: '', isCurrentMonth: false });
  }
  
  // Add days of the month - use direct string representation
  for (let i = 1; i <= daysInMonth; i++) {
    // Calculate the date string consistently in YYYYMMDD format
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = i.toString().padStart(2, '0');
    const dateStr = `${year}${monthStr}${dayStr}`;
    
    // Get day of week from a lookup table to avoid Date object inconsistencies
    const dayOfWeek = getDayOfWeekFromDayNumber(new Date(year, month - 1, i).getDay());
    
    days.push({
      date: dateStr,
      day: i,
      dayOfWeek,
      isCurrentMonth: true
    });
  }
  
  return days;
};

/**
 * Gets day of week name from day number (0-6)
 */
function getDayOfWeekFromDayNumber(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber];
}

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
 * Gets publications for a specific date - using direct string comparison
 */
export const getPublicationsForDate = (publications: Publication[], date: string): Publication[] => {
  // Return empty array for empty cells
  if (!date) return [];
  
  // Direct string comparison without any date object creation
  return publications.filter(pub => pub.ReleaseDate === date);
};

/**
 * Gets events for a specific date - using direct string comparison
 */
export const getEventsForDate = (events: Event[], date: string): Event[] => {
  // Return empty array for empty cells
  if (!date) return [];
  
  // Simple direct string comparison without date object creation
  return events.filter(event => {
    // Handle range of dates
    const eventStart = event.ReleaseDate;
    const eventEnd = event.EventEndDate || event.ReleaseDate;
    
    // Compare as strings since YYYYMMDD format can be compared lexicographically
    return date >= eventStart && date <= eventEnd;
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