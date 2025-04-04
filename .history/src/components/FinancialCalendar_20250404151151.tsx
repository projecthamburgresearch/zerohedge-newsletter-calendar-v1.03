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
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="px-4 py-2 bg-brand-yellow-300 text-black rounded hover:bg-brand-yellow-400"
            >
              {isGridView ? 'Switch to List View' : 'Switch to Grid View'}
            </button>
            <button
              onClick={handlePreviousMonth}
              className="px-4 py-2 bg-brand-yellow-300 text-black rounded hover:bg-brand-yellow-400"
            >
              Previous Month
            </button>
            <button
              onClick={handleNextMonth}
              className="px-4 py-2 bg-brand-yellow-300 text-black rounded hover:bg-brand-yellow-400"
            >
              Next Month
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Week Filter */}
          <select 
            className="p-2 border rounded"
            value={weekFilter || ''}
            onChange={(e) => setWeekFilter(e.target.value || null)}
          >
            <option value="">All Weeks</option>
            <option value="1">Week 1 (Apr 1-7)</option>
            <option value="2">Week 2 (Apr 8-14)</option>
            <option value="3">Week 3 (Apr 15-21)</option>
            <option value="4">Week 4 (Apr 22-30)</option>
          </select>

          {/* Day Filter */}
          <select 
            className="p-2 border rounded"
            value={dayFilter || ''}
            onChange={(e) => setDayFilter(e.target.value || null)}
          >
            <option value="">All Days</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>

          {/* Source Filter */}
          <select
            className="p-2 border rounded"
            value={sourceFilter || ''}
            onChange={(e) => setSourceFilter(e.target.value || null)}
          >
            <option value="">All Sources</option>
            {sourceOptions.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            className="p-2 border rounded"
            value={typeFilter || ''}
            onChange={(e) => setTypeFilter(e.target.value || null)}
          >
            <option value="">All Types</option>
            {typeOptions.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
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