import React, { useState, useEffect } from 'react';
import { CalendarGrid } from './CalendarGrid';
import ListView from './ListView';
import { CalendarFilters } from './CalendarFilters';
import { FooterStats } from './FooterStats';
import { usePublicationFilters } from '@/hooks/usePublicationFilters';
import { Publication, Event } from '@/types';
import { getDayOptions, getWeekOptions } from '@/utils/dateUtils';
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
  const institutionOptions: string[] = Array.from(new Set([
    ...publications.map(pub => pub.InstitutionName),
    ...events.map(event => event.CountryName)
  ])).sort();
  
  const frequencyOptions: string[] = Array.from(new Set([
    ...publications.map(pub => pub.FrequencyRelease),
    ...events.map(event => event.FrequencyRelease)
  ])).sort();
  
  const dayOptions = getDayOptions();
  const weekOptions = getWeekOptions(currentYear, currentMonth);

  // Apply filters to publications
  const filteredPublications = publications.filter(pub => {
    // Skip publications without valid ReleaseDate
    if (!pub.ReleaseDate) return false;
    
    if (dayFilter && pub.DayOfWeek !== dayFilter) return false;
    
    // Check if the publication is in the current month/year
    try {
      const pubDate = new Date(
        parseInt(pub.ReleaseDate.substring(0, 4)), 
        parseInt(pub.ReleaseDate.substring(4, 6)) - 1, 
        parseInt(pub.ReleaseDate.substring(6, 8))
      );
      if (pubDate.getMonth() + 1 !== currentMonth || pubDate.getFullYear() !== currentYear) return false;
      
      if (weekFilter) {
        const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const weekNum = Math.ceil((parseInt(pub.ReleaseDate.substring(6, 8)) + firstDayOfWeek - 1) / 7);
        if (weekNum.toString() !== weekFilter) return false;
      }
    } catch (error) {
      console.error('Error parsing date for publication:', pub);
      return false;
    }
    
    if (institutionFilter && pub.InstitutionName !== institutionFilter) return false;
    
    if (frequencyFilter && pub.FrequencyRelease !== frequencyFilter) return false;
    
    return true;
  });

  // Apply filters to events
  const filteredEvents = events.filter(event => {
    // Skip events without valid ReleaseDate
    if (!event.ReleaseDate) return false;
    
    if (dayFilter && event.DayOfWeek !== dayFilter) return false;
    
    // Check if the event is in the current month/year
    try {
      const eventDate = new Date(
        parseInt(event.ReleaseDate.substring(0, 4)), 
        parseInt(event.ReleaseDate.substring(4, 6)) - 1, 
        parseInt(event.ReleaseDate.substring(6, 8))
      );
      if (eventDate.getMonth() + 1 !== currentMonth || eventDate.getFullYear() !== currentYear) return false;
      
      if (weekFilter) {
        const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const weekNum = Math.ceil((parseInt(event.ReleaseDate.substring(6, 8)) + firstDayOfWeek - 1) / 7);
        if (weekNum.toString() !== weekFilter) return false;
      }
    } catch (error) {
      console.error('Error parsing date for event:', event);
      return false;
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
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Financial Calendar</h1>
          <span className="text-gray-500">{currentMonth}/2025</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button 
              onClick={handlePreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Previous Month"
            >
              <Image 
                src={`${basePath}/icons/arrow-left.svg`} 
                alt="Previous" 
                width={20} 
                height={20} 
              />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Next Month"
            >
              <Image 
                src={`${basePath}/icons/arrow-right.svg`} 
                alt="Next" 
                width={20} 
                height={20} 
              />
            </button>
          </div>
          
          <div className="flex border rounded overflow-hidden">
            <button 
              onClick={() => setIsGridView(true)} 
              className={`px-4 py-2 border-r ${isGridView ? 'bg-brand-yellow-100 text-black' : 'text-gray-500'}`}
            >
              <Image 
                src={`${basePath}/icons/calendar.svg`} 
                alt="Calendar View" 
                width={20} 
                height={20} 
              />
            </button>
            <button 
              onClick={() => setIsGridView(false)} 
              className={`px-4 py-2 ${!isGridView ? 'bg-brand-yellow-100 text-black' : 'text-gray-500'}`}
            >
              <Image 
                src={`${basePath}/icons/list.svg`} 
                alt="List View" 
                width={20} 
                height={20} 
              />
            </button>
          </div>
        </div>
      </div>
      
      <CalendarFilters 
        dayOptions={dayOptions}
        weekOptions={weekOptions}
        sourceOptions={institutionOptions}
        typeOptions={frequencyOptions}
        onDayFilterChange={setDayFilter}
        onWeekFilterChange={setWeekFilter}
        onSourceFilterChange={setInstitutionFilter}
        onTypeFilterChange={setFrequencyFilter}
        dayFilter={dayFilter}
        weekFilter={weekFilter}
        sourceFilter={institutionFilter}
        typeFilter={frequencyFilter}
      />
      
      {isGridView ? (
        <CalendarGrid 
          publications={filteredPublications}
          events={filteredEvents}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onPublicationClick={handlePublicationClick}
          onEventClick={handleEventClick}
        />
      ) : (
        <ListView 
          publications={filteredPublications}
          events={filteredEvents}
          onPublicationClick={handlePublicationClick}
          onEventClick={handleEventClick}
        />
      )}
      
      <FooterStats 
        publications={filteredPublications}
        events={filteredEvents}
      />
      
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