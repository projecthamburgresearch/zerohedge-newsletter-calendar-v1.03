import React, { useState, useEffect } from 'react';
import { CalendarGrid } from './CalendarGrid';
import ListView from './ListView';
import { CalendarFilters } from './CalendarFilters';
import { FooterStats } from './FooterStats';
import { Publication, Event } from '@/types';
import { getDayOptions, getWeekOptions, getWeekNumber } from '@/utils/dateUtils';
import { PublicationModal } from './modals/PublicationModal';
import { EventModal } from './modals/EventModal';
import { loadPublicationsFromCsv, loadEventsFromCsv } from '@/utils/csvParser';
import Image from 'next/image';

// Get the base path from next.config.js
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const FinancialCalendar: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [weekFilter, setWeekFilter] = useState<string | null>(null);
  const [institutionFilter, setInstitutionFilter] = useState<string | null>(null);
  const [frequencyFilter, setFrequencyFilter] = useState<string | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(4);

  // Load data from CSV
  useEffect(() => {
    async function loadData() {
      try {
        const [publicationsData, eventsData] = await Promise.all([
          loadPublicationsFromCsv(),
          loadEventsFromCsv()
        ]);
        
        setPublications(publicationsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Get options for filters from the loaded data
  const institutionOptions: string[] = [
    ...new Set([
      ...publications.map(pub => pub.InstitutionName),
      ...events.map(event => event.CountryName)
    ])
  ].sort();
  
  const frequencyOptions: string[] = [
    ...new Set([
      ...publications.map(pub => pub.FrequencyRelease),
      ...events.map(event => event.FrequencyRelease)
    ])
  ].sort();
  
  const dayOptions = getDayOptions();
  const weekOptions = getWeekOptions(currentYear, currentMonth);

  // Apply filters to publications
  const filteredPublications = publications.filter(pub => {
    if (dayFilter && pub.DayOfWeek !== dayFilter) return false;
    
    if (weekFilter) {
      const weekNum = getWeekNumber(pub.ReleaseDate);
      if (weekNum.toString() !== weekFilter) return false;
    }
    
    if (institutionFilter && pub.InstitutionName !== institutionFilter) return false;
    
    if (frequencyFilter && pub.FrequencyRelease !== frequencyFilter) return false;
    
    return true;
  });

  // Apply filters to events
  const filteredEvents = events.filter(event => {
    if (dayFilter && event.DayOfWeek !== dayFilter) return false;
    
    if (weekFilter) {
      const weekNum = getWeekNumber(event.ReleaseDate);
      if (weekNum.toString() !== weekFilter) return false;
    }
    
    if (institutionFilter && event.CountryName !== institutionFilter) return false;
    
    if (frequencyFilter && event.FrequencyRelease !== frequencyFilter) return false;
    
    return true;
  });

  const handlePublicationClick = (publication: Publication) => {
    setSelectedPublication(publication);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseModals = () => {
    setSelectedPublication(null);
    setSelectedEvent(null);
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading calendar data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12">
            <Image
              src={`${basePath}/assets/logos/Zerohedgelogo.svg`}
              alt="Zerohedge Logo"
              width={48}
              height={48}
              className="h-full w-auto"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold tracking-normal">
            ZEROHEDGE PREMIUM
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold">
              {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <CalendarFilters
            dayFilter={dayFilter}
            weekFilter={weekFilter}
            sourceFilter={institutionFilter}
            typeFilter={frequencyFilter}
            onDayFilterChange={setDayFilter}
            onWeekFilterChange={setWeekFilter}
            onSourceFilterChange={setInstitutionFilter}
            onTypeFilterChange={setFrequencyFilter}
            dayOptions={dayOptions}
            weekOptions={weekOptions}
            sourceOptions={institutionOptions}
            typeOptions={frequencyOptions}
          />
          <button
            onClick={() => setIsGridView(!isGridView)}
            className="px-4 py-2 bg-brand-yellow-300 text-black rounded hover:bg-brand-yellow-400 h-[38px]"
          >
            {isGridView ? 'Switch to List View' : 'Switch to Grid View'}
          </button>
        </div>
      </div>
      
      {isGridView ? (
        <CalendarGrid
          publications={filteredPublications}
          events={filteredEvents}
          onPublicationClick={handlePublicationClick}
          onEventClick={handleEventClick}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      ) : (
        <ListView
          publications={filteredPublications}
          events={filteredEvents}
          onPublicationClick={handlePublicationClick}
          onEventClick={handleEventClick}
        />
      )}
      
      <FooterStats publications={filteredPublications} />

      {selectedPublication && (
        <PublicationModal
          publication={selectedPublication}
          onClose={handleCloseModals}
        />
      )}
      
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default FinancialCalendar;

<style jsx global>{`
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #CBD5E0;
    border-radius: 2px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #A0AEC0;
  }
  
  .group:hover > .group-hover\\:block {
    display: block !important;
    pointer-events: auto !important;
  }
`}</style> 