import Papa from 'papaparse';
import { Publication, Event } from '@/types';

// Enable for debugging
const DEBUG = true;

// Consistent date parsing function used throughout the file
function parseDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-based month
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}

// Helper to get a value from a row, accounting for potential space in the column name
function getColumnValue(row: Record<string, any>, baseColumnName: string): any {
  // Try the base name first
  if (row[baseColumnName] !== undefined) return row[baseColumnName];
  
  // Try with a space at the end
  if (row[`${baseColumnName} `] !== undefined) return row[`${baseColumnName} `];
  
  // Try with a space at the beginning
  if (row[` ${baseColumnName}`] !== undefined) return row[` ${baseColumnName}`];
  
  // Try with spaces on both sides
  if (row[` ${baseColumnName} `] !== undefined) return row[` ${baseColumnName} `];
  
  // Special case for OnlineAvailability column which might have a special character prefix
  if (baseColumnName === 'OnlineAvailability') {
    // Find any key that ends with 'OnlineAvailability' regardless of prefix
    const onlineAvailabilityKey = Object.keys(row).find(key => 
      key.endsWith('OnlineAvailability') || key.endsWith('OnlineAvailability ')
    );
    
    if (onlineAvailabilityKey && row[onlineAvailabilityKey] !== undefined) {
      if (DEBUG) console.log(`Found OnlineAvailability with key: ${onlineAvailabilityKey}`);
      return row[onlineAvailabilityKey];
    }
  }
  
  // Log if missing and in debug mode
  if (DEBUG) {
    console.warn(`Column not found: "${baseColumnName}". Available columns: ${Object.keys(row).join(', ')}`);
  }
  
  // If not found, return empty string
  return '';
}

export async function loadPublicationsFromCsv(): Promise<Publication[]> {
  try {
    // Updated CSV path
    if (DEBUG) console.log('Loading publications from CSV...');
    const response = await fetch('/publications_final.csv');
    
    if (!response.ok) {
      throw new Error(`HTTP error loading publications! Status: ${response.status}`);
    }
    
    const csvText = await response.text();
    if (DEBUG) console.log(`Loaded ${csvText.length} bytes from publications CSV`);
    
    const result = Papa.parse(csvText, { header: true });
    
    if (result.errors && result.errors.length > 0) {
      console.error('Parse errors:', result.errors);
    }
    
    if (DEBUG) console.log(`Parsed ${result.data.length} publications rows`);
    
    // Show the first row for debugging
    if (DEBUG && result.data.length > 0) {
      const firstRow = result.data[0] as Record<string, any>;
      console.log('First row headers:', Object.keys(firstRow));
      console.log('First row data:', firstRow);
    }
    
    return result.data.map((row) => {
      const typedRow = row as Record<string, any>;
      return {
        ReleaseDate: getColumnValue(typedRow, 'ReleaseDate'),
        DayOfWeek: getColumnValue(typedRow, 'DayOfWeek'),
        InstitutionName: getColumnValue(typedRow, 'InstitutionName'),
        PublicationTitle: getColumnValue(typedRow, 'PublicationTitle'),
        TeamName: getColumnValue(typedRow, 'TeamName'),
        ContentTeam: getColumnValue(typedRow, 'ContentTeam'),
        FrequencyRelease: getColumnValue(typedRow, 'FrequencyRelease'),
        PrimaryFocus: getColumnValue(typedRow, 'PrimaryFocus'),
        KeywordTags: getColumnValue(typedRow, 'KeywordTags')?.split(',').map((tag: string) => tag.trim()) || [],
        ReleasedLastYear: ['yes', 'true', 'available', '1'].includes(String(getColumnValue(typedRow, 'ReleasedLastYear')).toLowerCase()),
        OnlineAvailability: String(getColumnValue(typedRow, 'OnlineAvailability')).toLowerCase() === 'available' || 
                           ['yes', 'true', '1'].includes(String(getColumnValue(typedRow, 'OnlineAvailability')).toLowerCase()),
        IsActualData: ['yes', 'true', 'available', '1'].includes(String(getColumnValue(typedRow, 'IsActualData')).toLowerCase())
      };
    });
  } catch (error) {
    console.error('Error loading publications from CSV:', error);
    return [];
  }
}

export async function loadEventsFromCsv(): Promise<Event[]> {
  try {
    // Updated CSV path
    if (DEBUG) console.log('Loading events from CSV...');
    const response = await fetch('/events_final.csv');
    
    if (!response.ok) {
      throw new Error(`HTTP error loading events! Status: ${response.status}`);
    }
    
    const csvText = await response.text();
    if (DEBUG) console.log(`Loaded ${csvText.length} bytes from events CSV`);
    
    const result = Papa.parse(csvText, { header: true });
    
    if (result.errors && result.errors.length > 0) {
      console.error('Parse errors:', result.errors);
    }
    
    if (DEBUG) console.log(`Parsed ${result.data.length} events rows`);
    
    // Show the first row for debugging
    if (DEBUG && result.data.length > 0) {
      const firstRow = result.data[0] as Record<string, any>;
      console.log('First row headers:', Object.keys(firstRow));
      console.log('First row data:', firstRow);
    }
    
    return result.data.map((row) => {
      const typedRow = row as Record<string, any>;
      return {
        EventIdentifier: getColumnValue(typedRow, 'EventIdentifier'),
        EventTitle: getColumnValue(typedRow, 'EventTitle'),
        CountryName: getColumnValue(typedRow, 'CountryName'),
        ReleaseDate: getColumnValue(typedRow, 'ReleaseDate'),
        EventEndDate: getColumnValue(typedRow, 'EventEndDate') || getColumnValue(typedRow, 'ReleaseDate'), // Ensure endDate is never undefined
        EventDescription: getColumnValue(typedRow, 'EventDescription'),
        FrequencyRelease: getColumnValue(typedRow, 'FrequencyRelease'),
        PrimaryFocus: getColumnValue(typedRow, 'PrimaryFocus'),
        KeywordsTags: getColumnValue(typedRow, 'KeywordsTags')?.split(',').map((tag: string) => tag.trim()) || [],
        IsActualData: ['yes', 'true', 'available', '1'].includes(String(getColumnValue(typedRow, 'IsActualData')).toLowerCase()),
        DayOfWeek: getColumnValue(typedRow, 'DayOfWeek')
      };
    });
  } catch (error) {
    console.error('Error loading events from CSV:', error);
    return [];
  }
}

function getDayOfWeekFromDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
} 