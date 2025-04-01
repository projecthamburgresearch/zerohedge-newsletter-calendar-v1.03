import { Publication, Event, CalendarMonth } from '@/types';

/**
 * Loads calendar data for a specific month
 */
export const loadMonthData = async (year: number, month: number): Promise<CalendarMonth> => {
  // Load publications data
  const publications = await loadPublications(year, month);
  
  // Load events data
  const events = await loadEvents(year, month);

  // Generate calendar days
  const days = generateCalendarDays(year, month);

  return {
    year,
    month,
    days,
    publications,
    events
  };
};

/**
 * Load publications for a specific month
 */
const loadPublications = async (year: number, month: number): Promise<Publication[]> => {
  try {
    // Import the publications data
    const data = await import('@/data/publications.json');
    
    // Filter publications for the specified month
    return data.publications.map((pub: any): Publication => ({
      date: pub.date,
      dayOfWeek: pub.dayOfWeek,
      source: pub.source,
      seriesTitle: pub.seriesTitle,
      domain: pub.domain,
      author: pub.author,
      newsletterType: pub.newsletterType,
      primaryFocus: pub.primaryFocus,
      specificTags: Array.isArray(pub.specificTags) ? pub.specificTags : pub.specificTags.split(',').map((t: string) => t.trim()),
      previousYearReleased: typeof pub.previousYearReleased === 'boolean' ? pub.previousYearReleased : pub.previousYearRelease === 'Yes',
      internetSourceSupport: typeof pub.internetSourceSupport === 'boolean' ? pub.internetSourceSupport : pub.internetSourceSupport === 'Yes'
    })).filter((pub: Publication) => {
      const pubDate = new Date(pub.date);
      return pubDate.getFullYear() === year && pubDate.getMonth() === month;
    });
  } catch (error) {
    console.error('Error loading publications:', error);
    return [];
  }
};

/**
 * Load events for a specific month
 */
const loadEvents = async (year: number, month: number): Promise<Event[]> => {
  // TODO: Implement events loading
  return [];
};

/**
 * Generate calendar days for a month
 */
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const days = [];
  
  // Add empty days for padding at start of month
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({
      date: '',
      day: 0,
      dayOfWeek: '',
      isEmpty: true
    });
  }
  
  // Add actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date: date.toISOString().split('T')[0],
      day,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      isEmpty: false
    });
  }
  
  return days;
};

/**
 * Creates the directory structure for a new month
 */
export const createMonthDirectory = async (year: number, month: number) => {
  // This function would typically be implemented in a backend service
  // For now, we'll just log what would be created
  console.log(`Creating directory structure for ${year}-${month + 1}:`);
  console.log(`- /data/${year}/${month + 1}/`);
  console.log(`- /data/${year}/${month + 1}/publications.json`);
  console.log(`- /data/${year}/${month + 1}/events.json`);
};

/**
 * Saves calendar data for a specific month
 */
export const saveMonthData = async (
  year: number,
  month: number,
  publications: Publication[],
  events: Event[]
) => {
  // This function would typically be implemented in a backend service
  // For now, we'll just log what would be saved
  console.log(`Saving data for ${year}-${month + 1}:`);
  console.log('Publications:', publications);
  console.log('Events:', events);
}; 