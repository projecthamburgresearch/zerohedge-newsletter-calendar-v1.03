import Papa from 'papaparse';
import { Publication } from '@/types';

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