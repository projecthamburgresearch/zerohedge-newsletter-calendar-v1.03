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
    const response = await fetch('/publications_final.csv');
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    
    return result.data.map((row: any) => ({
      ReleaseDate: row.ReleaseDate,
      DayOfWeek: row.DayOfWeek,
      InstitutionName: row.InstitutionName,
      PublicationTitle: row.PublicationTitle,
      TeamName: row.TeamName,
      ContentTeam: row.ContentTeam,
      FrequencyRelease: row.FrequencyRelease,
      PrimaryFocus: row.PrimaryFocus,
      KeywordTags: row.KeywordTags?.split(',').map((tag: string) => tag.trim()) || [],
      ReleasedLastYear: ['yes', 'true', 'available', '1'].includes(String(row.ReleasedLastYear).toLowerCase()),
      OnlineAvailability: ['yes', 'true', 'available', '1'].includes(String(row.OnlineAvailability).toLowerCase()),
      IsActualData: ['yes', 'true', 'available', '1'].includes(String(row.IsActualData).toLowerCase())
    }));
  } catch (error) {
    console.error('Error loading publications from CSV:', error);
    return [];
  }
}

export async function loadEventsFromCsv(): Promise<Event[]> {
  try {
    const response = await fetch('/events_final.csv');
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    
    return result.data.map((row: any) => ({
      EventIdentifier: row.EventIdentifier,
      EventTitle: row.EventTitle,
      CountryName: row.CountryName,
      ReleaseDate: row.ReleaseDate,
      EventEndDate: row.EventEndDate || row.ReleaseDate, // Ensure EventEndDate is never undefined
      EventDescription: row.EventDescription,
      FrequencyRelease: row.FrequencyRelease,
      PrimaryFocus: row.PrimaryFocus,
      KeywordsTags: row.KeywordsTags?.split(',').map((tag: string) => tag.trim()) || [],
      IsActualData: ['yes', 'true', 'available', '1'].includes(String(row.IsActualData).toLowerCase()),
      DayOfWeek: row.DayOfWeek
    }));
  } catch (error) {
    console.error('Error loading events from CSV:', error);
    return [];
  }
}

// Helper functions
function getDayOfWeekFromDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
} 