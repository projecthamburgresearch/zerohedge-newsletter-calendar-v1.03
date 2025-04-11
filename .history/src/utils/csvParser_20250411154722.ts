import Papa from 'papaparse';
import { Publication, Event } from '@/types';

// Consistent date parsing function used throughout the file
function parseDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-based month
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}

// Helper to get a value from a row, accounting for potential space in the column name
function getColumnValue(row: any, baseColumnName: string): any {
  // Try the base name first
  if (row[baseColumnName] !== undefined) return row[baseColumnName];
  
  // Try with a space at the end
  if (row[`${baseColumnName} `] !== undefined) return row[`${baseColumnName} `];
  
  // Try with a space at the beginning
  if (row[` ${baseColumnName}`] !== undefined) return row[` ${baseColumnName}`];
  
  // Try with spaces on both sides
  if (row[` ${baseColumnName} `] !== undefined) return row[` ${baseColumnName} `];
  
  // If not found, return empty string
  return '';
}

export async function loadPublicationsFromCsv(): Promise<Publication[]> {
  try {
    // Updated CSV path
    const response = await fetch('/publications_final.csv');
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    
    return result.data.map((row: any) => ({
      ReleaseDate: getColumnValue(row, 'ReleaseDate'),
      DayOfWeek: getColumnValue(row, 'DayOfWeek'),
      InstitutionName: getColumnValue(row, 'InstitutionName'),
      PublicationTitle: getColumnValue(row, 'PublicationTitle'),
      TeamName: getColumnValue(row, 'TeamName'),
      ContentTeam: getColumnValue(row, 'ContentTeam'),
      FrequencyRelease: getColumnValue(row, 'FrequencyRelease'),
      PrimaryFocus: getColumnValue(row, 'PrimaryFocus'),
      KeywordTags: getColumnValue(row, 'KeywordTags')?.split(',').map((tag: string) => tag.trim()) || [],
      ReleasedLastYear: ['yes', 'true', 'available', '1'].includes(String(getColumnValue(row, 'ReleasedLastYear')).toLowerCase()),
      OnlineAvailability: ['yes', 'true', 'available', '1'].includes(String(getColumnValue(row, 'OnlineAvailability')).toLowerCase()),
      IsActualData: ['yes', 'true', 'available', '1'].includes(String(getColumnValue(row, 'IsActualData')).toLowerCase())
    }));
  } catch (error) {
    console.error('Error loading publications from CSV:', error);
    return [];
  }
}

export async function loadEventsFromCsv(): Promise<Event[]> {
  try {
    // Updated CSV path
    const response = await fetch('/events_final.csv');
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    
    return result.data.map((row: any) => ({
      EventIdentifier: getColumnValue(row, 'EventIdentifier'),
      EventTitle: getColumnValue(row, 'EventTitle'),
      CountryName: getColumnValue(row, 'CountryName'),
      ReleaseDate: getColumnValue(row, 'ReleaseDate'),
      EventEndDate: getColumnValue(row, 'EventEndDate') || getColumnValue(row, 'ReleaseDate'), // Ensure endDate is never undefined
      EventDescription: getColumnValue(row, 'EventDescription'),
      FrequencyRelease: getColumnValue(row, 'FrequencyRelease'),
      PrimaryFocus: getColumnValue(row, 'PrimaryFocus'),
      KeywordsTags: getColumnValue(row, 'KeywordsTags')?.split(',').map((tag: string) => tag.trim()) || [],
      IsActualData: ['yes', 'true', 'available', '1'].includes(String(getColumnValue(row, 'IsActualData')).toLowerCase()),
      DayOfWeek: getColumnValue(row, 'DayOfWeek')
    }));
  } catch (error) {
    console.error('Error loading events from CSV:', error);
    return [];
  }
}

function getDayOfWeekFromDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
} 