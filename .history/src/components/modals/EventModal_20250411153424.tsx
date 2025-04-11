import React from 'react';
import { Event } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { BaseModal } from './BaseModal';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

/**
 * Modal component for displaying detailed information about a special event
 * @param event - The event to display
 * @param onClose - Function to call when the modal should be closed
 */
export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  /**
   * Renders the event date range
   */
  const renderDateRange = () => (
    <div className="text-gray-600 mb-4">
      {formatDate(event.ReleaseDate)}
      {event.ReleaseDate !== event.EventEndDate && ` - ${formatDate(event.EventEndDate || '')}`}
    </div>
  );

  /**
   * Renders the event description
   */
  const renderDescription = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Description</div>
      <div className="text-gray-600">{event.EventDescription}</div>
    </div>
  );

  /**
   * Renders the event type
   */
  const renderEventType = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Focus Area</div>
      <div className="bg-yellow-100 text-yellow-800 inline-block px-2 py-1 rounded">
        {event.PrimaryFocus}
      </div>
    </div>
  );

  /**
   * Renders the country information
   */
  const renderCountry = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Country</div>
      <div className="bg-blue-100 text-blue-800 inline-block px-2 py-1 rounded">
        {event.CountryName}
      </div>
    </div>
  );

  /**
   * Renders the data validity information
   */
  const renderDataValidity = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Is Actual Data</div>
      <div className={`inline-block px-2 py-1 rounded ${event.IsActualData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {event.IsActualData ? 'Yes' : 'No'}
      </div>
    </div>
  );

  /**
   * Renders the related sources
   */
  const renderRelatedSources = () => {
    if (!event.KeywordsTags || event.KeywordsTags.length === 0) return null;
    
    return (
      <div>
        <div className="font-semibold text-gray-700 mb-2">Keywords</div>
        <div className="flex flex-wrap gap-1">
          {event.KeywordsTags.map((source: string, i: number) => (
            <span key={i} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
              {source}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <BaseModal title={event.EventTitle} onClose={onClose}>
      {renderDateRange()}
      {renderDescription()}
      {renderEventType()}
      {renderCountry()}
      {renderDataValidity()}
      {renderRelatedSources()}
    </BaseModal>
  );
}; 