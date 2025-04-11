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
  
  // First, calculate the first day of the month (0 = Sunday, 1 = Monday, etc.)
  // Using UTC to avoid timezone issues
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const firstDayOfWeekIndex = firstDay.getUTCDay();
  
  // Calculate the last day of the month
  const lastDay = new Date(Date.UTC(year, month, 0));
  const daysInMonth = lastDay.getUTCDate();
  
  // Add empty days for the days before the first day of the month
  // but only for the days of the week before the 1st of the month
  for (let i = 0; i < firstDayOfWeekIndex; i++) {
    days.push({ date: '', day: 0, dayOfWeek: '', isCurrentMonth: false });
  }
  
  // Add each day of the month with proper formatting
  for (let i = 1; i <= daysInMonth; i++) {
    // Create a date for this day using UTC
    const currentDate = new Date(Date.UTC(year, month - 1, i));
    
    // Format the date as YYYYMMDD
    const dateStr = formatYYYYMMDD(year, month, i);
    
    // Get day of week using UTC to avoid timezone issues
    const dayOfWeek = getDayOfWeekName(currentDate.getUTCDay());
    
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
 * Helper function to format a date as YYYYMMDD
 */
function formatYYYYMMDD(year: number, month: number, day: number): string {
  const paddedMonth = month.toString().padStart(2, '0');
  const paddedDay = day.toString().padStart(2, '0');
  return `${year}${paddedMonth}${paddedDay}`;
}

/**
 * Helper function to get day of week name
 */
function getDayOfWeekName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
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
 * Gets publications for a specific date
 */
export const getPublicationsForDate = (publications: Publication[], date: string): Publication[] => {
  if (!date || date.length !== 8) {
    return [];
  }
  
  return publications.filter(pub => {
    return pub.ReleaseDate && pub.ReleaseDate === date;
  });
};

/**
 * Gets events for a specific date
 */
export const getEventsForDate = (events: Event[], date: string): Event[] => {
  if (!date || date.length !== 8) {
    return [];
  }
  
  return events.filter(event => {
    // Ensure event has a valid ReleaseDate
    if (!event.ReleaseDate || event.ReleaseDate.length !== 8) {
      return false;
    }
    
    // Parse the dates into numbers for comparison (YYYYMMDD format as integers)
    const dateInt = parseInt(date);
    const startDateInt = parseInt(event.ReleaseDate);
    
    // If there's an end date, use it, otherwise assume it's the same as the start date
    let endDateInt = startDateInt;
    if (event.EventEndDate && event.EventEndDate.length === 8) {
      endDateInt = parseInt(event.EventEndDate);
    }
    
    // Check if the target date is within the event's date range
    return dateInt >= startDateInt && dateInt <= endDateInt;
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