export interface Publication {
  date: string;
  dayOfWeek: string;
  source: string;
  seriesTitle: string;
  domain: string;
  author: string;
  newsletterType: string;
  primaryFocus: string;
  specificTags: string | string[];
  previousYearReleased: boolean;
  internetSourceSupport: boolean;
}

export interface Event {
  id: string;
  startDate: string;
  endDate?: string;
  dayOfWeek: string;
  type: string;
  title: string;
  description: string;
  relatedSources: string[];
}

export interface CalendarDay {
  date: string;
  day: number;
  dayOfWeek: string;
  isEmpty: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
  publications: Publication[];
  events: Event[];
}

export interface CalendarState {
  currentYear: number;
  currentMonth: number;
  selectedDate: string | null;
  selectedPublication: Publication | null;
  selectedEvent: Event | null;
  dayFilter: string | null;
  weekFilter: string | null;
  sourceFilter: string | null;
  typeFilter: string | null;
  viewMode: 'calendar' | 'list';
}

export interface CalendarFilters {
  dayOptions: { value: string; label: string; }[];
  weekOptions: { value: string; label: string; }[];
  sourceOptions: string[];
  typeOptions: string[];
}

export interface SourceGroup {
  source: string;
  titles: string[];
}

export interface PublicationType {
  Daily: 'Daily';
  Weekly: 'Weekly';
  Monthly: 'Monthly';
  Quarterly: 'Quarterly';
  Occasional: 'Occasional';
} 