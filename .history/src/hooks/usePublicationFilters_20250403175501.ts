import { useState, useCallback, useMemo } from 'react';
import { Publication } from '@/types';
import { getWeekNumber } from '@/utils/dateUtils';

interface FilterState {
  week: string | null;
  source: string | null;
  type: string | null;
}

/**
 * Custom hook that manages publication filtering in the calendar.
 * Provides filtered publications based on various criteria.
 * @param publications - Array of publications to filter
 * @param dayFilter - Day filter value
 * @param weekFilter - Week filter value
 * @param sourceFilter - Source filter value
 * @param typeFilter - Type filter value
 * @param currentYear - Current year
 * @param currentMonth - Current month
 * @returns Object containing filtered publications
 */
export const usePublicationFilters = (
  publications: Publication[],
  dayFilter: string | null,
  weekFilter: string | null,
  sourceFilter: string | null,
  typeFilter: string | null,
  currentYear: number,
  currentMonth: number
) => {
  const filteredPublications = publications.filter(publication => {
    // First filter by month and year
    const pubDate = new Date(
      parseInt(publication.date.substring(0, 4)),
      parseInt(publication.date.substring(4, 6)) - 1,  // Convert 1-based month to 0-based
      parseInt(publication.date.substring(6, 8))
    );
    
    // Both the publication date and currentMonth are now in 1-based format
    const pubMonth = parseInt(publication.date.substring(4, 6));
    if (pubDate.getFullYear() !== currentYear || pubMonth !== currentMonth) {
      return false;
    }

    // Then apply other filters
    if (dayFilter && publication.dayOfWeek !== dayFilter) {
      return false;
    }

    if (weekFilter) {
      const weekNumber = Math.ceil(parseInt(publication.date.substring(6, 8)) / 7);
      if (weekNumber.toString() !== weekFilter) {
        return false;
      }
    }

    if (sourceFilter && publication.source !== sourceFilter) {
      return false;
    }

    if (typeFilter && publication.newsletterType !== typeFilter) {
      return false;
    }

    return true;
  });

  return { filteredPublications };
}; 