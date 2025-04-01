import { Publication, SpecialEvent, CalendarMonth } from '@/types';

/**
 * Loads calendar data for a specific month
 */
export const loadMonthData = async (year: number, month: number): Promise<CalendarMonth> => {
  try {
    // Load publications for the month
    const publications = await import(`@/data/${year}/${month + 1}/publications.json`)
      .then(module => module.default as Publication[])
      .catch(() => [] as Publication[]);

    // Load events for the month
    const events = await import(`@/data/${year}/${month + 1}/events.json`)
      .then(module => module.default as SpecialEvent[])
      .catch(() => [] as SpecialEvent[]);

    // Get days for the month
    const days = getMonthDays(year, month);

    return {
      year,
      month,
      days,
      publications,
      events
    };
  } catch (error) {
    console.error(`Error loading data for ${year}-${month + 1}:`, error);
    return {
      year,
      month,
      days: getMonthDays(year, month),
      publications: [],
      events: []
    };
  }
};

/**
 * Gets all days in a month
 */
const getMonthDays = (year: number, month: number) => {
  const days = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: '', day: 0, dayOfWeek: '', isEmpty: true });
  }
  
  // Add the days of the month
  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(year, month, i);
    const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '');
    days.push({
      date: formattedDate,
      day: i,
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
  events: SpecialEvent[]
) => {
  // This function would typically be implemented in a backend service
  // For now, we'll just log what would be saved
  console.log(`Saving data for ${year}-${month + 1}:`);
  console.log('Publications:', publications);
  console.log('Events:', events);
}; 