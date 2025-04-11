export interface Publication {
  ReleaseDate: string;
  DayOfWeek: string;
  InstitutionName: string;
  PublicationTitle: string;
  TeamName: string;
  ContentTeam: string;
  FrequencyRelease: string;
  PrimaryFocus: string;
  KeywordTags: string[];
  ReleasedLastYear: boolean;
  OnlineAvailability: boolean;
  IsActualData: boolean;
}

export interface Event {
  EventIdentifier: string;
  EventTitle: string;
  CountryName: string;
  ReleaseDate: string;
  EventEndDate: string;
  EventDescription: string;
  FrequencyRelease: string;
  PrimaryFocus: string;
  KeywordsTags: string[];
  IsActualData: boolean;
  DayOfWeek: string;
}

export interface CalendarDay {
  date: string;
  day: number;
  dayOfWeek: string;
  isCurrentMonth: boolean;
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

export enum PublicationType {
  Daily: 'Daily',
  Weekly: 'Weekly',
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  Occasional: 'Occasional',
} 