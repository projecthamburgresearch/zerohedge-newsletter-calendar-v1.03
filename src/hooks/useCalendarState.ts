import { useState, useEffect } from 'react';
import { CalendarState, CalendarFilters, CalendarMonth, Publication, SpecialEvent } from '@/types';
import { loadMonthData } from '@/utils/calendarData';
import { getWeekOptions, groupPublicationsBySource } from '@/utils/dateUtils';

interface UseCalendarStateProps {
  initialYear?: number;
  initialMonth?: number;
}

interface UseCalendarStateReturn {
  state: CalendarState;
  filters: CalendarFilters;
  currentMonth: CalendarMonth;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  handleWeekFilterChange: (value: string | null) => void;
  handleSourceFilterChange: (value: string | null) => void;
  handleTypeFilterChange: (value: string | null) => void;
  handlePublicationSelect: (publication: Publication | null) => void;
  handleEventSelect: (event: SpecialEvent | null) => void;
}

/**
 * Hook to manage calendar state and data loading
 */
export const useCalendarState = ({
  initialYear = new Date().getFullYear(),
  initialMonth = new Date().getMonth()
}: UseCalendarStateProps = {}): UseCalendarStateReturn => {
  // Calendar state
  const [state, setState] = useState<CalendarState>({
    currentYear: initialYear,
    currentMonth: initialMonth,
    selectedDate: null,
    selectedPublication: null,
    selectedEvent: null,
    weekFilter: null,
    sourceFilter: null,
    typeFilter: null
  });

  // Calendar filters
  const [filters, setFilters] = useState<CalendarFilters>({
    weekOptions: [],
    sourceOptions: [],
    typeOptions: []
  });

  // Current month data
  const [currentMonth, setCurrentMonth] = useState<CalendarMonth>({
    year: initialYear,
    month: initialMonth,
    days: [],
    publications: [],
    events: []
  });

  // Load month data when year/month changes
  useEffect(() => {
    const loadData = async () => {
      const monthData = await loadMonthData(state.currentYear, state.currentMonth);
      setCurrentMonth(monthData);

      // Update filters
      setFilters({
        weekOptions: getWeekOptions(state.currentYear, state.currentMonth),
        sourceOptions: groupPublicationsBySource(monthData.publications),
        typeOptions: Array.from(new Set(monthData.events.map(event => event.type)))
      });
    };

    loadData();
  }, [state.currentYear, state.currentMonth]);

  // Navigation handlers
  const handlePreviousMonth = () => {
    setState(prev => {
      const newMonth = prev.currentMonth - 1;
      const newYear = newMonth < 0 ? prev.currentYear - 1 : prev.currentYear;
      return {
        ...prev,
        currentMonth: newMonth < 0 ? 11 : newMonth,
        currentYear: newYear,
        selectedDate: null,
        weekFilter: null
      };
    });
  };

  const handleNextMonth = () => {
    setState(prev => {
      const newMonth = prev.currentMonth + 1;
      const newYear = newMonth > 11 ? prev.currentYear + 1 : prev.currentYear;
      return {
        ...prev,
        currentMonth: newMonth > 11 ? 0 : newMonth,
        currentYear: newYear,
        selectedDate: null,
        weekFilter: null
      };
    });
  };

  // Filter handlers
  const handleWeekFilterChange = (value: string | null) => {
    setState(prev => ({ ...prev, weekFilter: value }));
  };

  const handleSourceFilterChange = (value: string | null) => {
    setState(prev => ({ ...prev, sourceFilter: value }));
  };

  const handleTypeFilterChange = (value: string | null) => {
    setState(prev => ({ ...prev, typeFilter: value }));
  };

  // Selection handlers
  const handlePublicationSelect = (publication: Publication | null) => {
    setState(prev => ({ ...prev, selectedPublication: publication }));
  };

  const handleEventSelect = (event: SpecialEvent | null) => {
    setState(prev => ({ ...prev, selectedEvent: event }));
  };

  return {
    state,
    filters,
    currentMonth,
    handlePreviousMonth,
    handleNextMonth,
    handleWeekFilterChange,
    handleSourceFilterChange,
    handleTypeFilterChange,
    handlePublicationSelect,
    handleEventSelect
  };
}; 