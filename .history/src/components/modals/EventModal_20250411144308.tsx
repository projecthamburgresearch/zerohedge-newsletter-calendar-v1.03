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
   * Renders country name
   */
  const renderCountry = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Country</div>
      <div className="text-gray-600">{event.CountryName}</div>
    </div>
  );

  /**
   * Renders frequency information
   */
  const renderFrequency = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Frequency</div>
      <div className="text-gray-600">{event.FrequencyRelease}</div>
    </div>
  );

  /**
   * Renders the related sources
   */
  const renderRelatedSources = () => (
    <div>
      <div className="font-semibold text-gray-700 mb-2">Keywords</div>
      <div className="flex flex-wrap gap-1">
        {event.KeywordsTags.map((tag: string, i: number) => (
          <span key={i} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <BaseModal title={event.EventTitle} onClose={onClose}>
      {renderDateRange()}
      {renderCountry()}
      {renderDescription()}
      {renderEventType()}
      {renderFrequency()}
      {renderRelatedSources()}
      <div className="mt-4 text-sm text-gray-500">
        Is Actual Data: {event.IsActualData ? 'Yes' : 'No'}
      </div>
    </BaseModal>
  );
}; 