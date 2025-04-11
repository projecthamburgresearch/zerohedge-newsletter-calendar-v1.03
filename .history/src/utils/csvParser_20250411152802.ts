import Papa from 'papaparse';
import { Publication, Event } from '@/types';

// Consistent date parsing function used throughout the file
function parseDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-based month
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}

export async function loadPublicationsFromCsv(): Promise<Publication[]> {
  try {
    const response = await fetch('/financial_publications_april_2025.csv');
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    
    return result.data.map((row: any) => ({
      date: row.Date,
      dayOfWeek: row.DayOfWeek,
      source: row.Source,
      seriesTitle: row.SeriesTitle,
      domain: row.Domain,
      author: row.Author,
      newsletterType: row.NewsletterType,
      primaryFocus: row.PrimaryFocus,
      specificTags: row.SpecificTags.split(',').map((tag: string) => tag.trim()),
      previousYearReleased: ['yes', 'true', 'available', '1'].includes(row.PreviousYearRelease.toLowerCase()),
      internetSourceSupport: ['yes', 'true', 'available', '1'].includes(row.InternetSourceSupport.toLowerCase())
    }));
  } catch (error) {
    console.error('Error loading publications from CSV:', error);
    return [];
  }
}

export async function loadEventsFromCsv(): Promise<Event[]> {
  try {
    const response = await fetch('/special_events_april_2025.csv');
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    
    return result.data.map((row: any) => ({
      id: row.EventID, // Map CSV's EventID to interface's id property
      title: row.Title,
      startDate: row.StartDate,
      endDate: row.EndDate || row.StartDate, // Ensure endDate is never undefined
      dayOfWeek: getDayOfWeekFromDate(parseDate(row.StartDate)),
      type: row.Type,
      description: row.Description,
      relatedSources: row.RelatedSources.split(',').map((source: string) => source.trim())
    }));
  } catch (error) {
    console.error('Error loading events from CSV:', error);
    return [];
  }
}

function getDayOfWeekFromDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
} 