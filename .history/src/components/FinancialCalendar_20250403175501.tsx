import React, { useState } from 'react';
import { CalendarGrid } from './CalendarGrid';
import ListView from './ListView';
import { CalendarFilters } from './CalendarFilters';
import { FooterStats } from './FooterStats';
import { usePublicationFilters } from '@/hooks/usePublicationFilters';
import { Publication, Event } from '@/types';
import { getDayOptions, getWeekOptions } from '@/utils/dateUtils';
import { PublicationModal } from './modals/PublicationModal';
import { EventModal } from './modals/EventModal';
import Image from 'next/image';

// Import the JSON data directly
import publicationsJson from '../data/publications.json';
import specialEventsJson from '../data/special-events.json';

// Get the base path from next.config.js
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Type assertions for the imported JSON
const publicationsData = (publicationsJson as any).publications as Publication[];
const specialEventsData = (specialEventsJson as any).specialEvents as Event[];

export const FinancialCalendar: React.FC = () => {
  const [isGridView, setIsGridView] = useState(true);
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [weekFilter, setWeekFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(4);

  const sourceOptions: string[] = Array.from(new Set(publicationsData.map(pub => pub.source)));
  const typeOptions: string[] = Array.from(new Set(publicationsData.map(pub => pub.newsletterType)));
  const dayOptions = getDayOptions();
  const weekOptions = getWeekOptions(2025, 4); // Hardcoded for now, will make dynamic later

  const { filteredPublications } = usePublicationFilters(
    publicationsData,
    dayFilter,
    weekFilter,
    sourceFilter,
    typeFilter,
    currentYear,
    currentMonth
  );

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

      <div className="mb-4">
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
            sourceFilter={sourceFilter}
            typeFilter={typeFilter}
            onDayFilterChange={setDayFilter}
            onWeekFilterChange={setWeekFilter}
            onSourceFilterChange={setSourceFilter}
            onTypeFilterChange={setTypeFilter}
            dayOptions={dayOptions}
            weekOptions={weekOptions}
            sourceOptions={sourceOptions}
            typeOptions={typeOptions}
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
          events={specialEventsData}
          onPublicationClick={handlePublicationClick}
          onEventClick={handleEventClick}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      ) : (
        <ListView
          publications={filteredPublications}
          events={specialEventsData}
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