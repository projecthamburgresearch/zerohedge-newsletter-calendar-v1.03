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
      {formatDate(event.startDate)}
      {event.startDate !== event.endDate && ` - ${formatDate(event.endDate || '')}`}
    </div>
  );

  /**
   * Renders the event description
   */
  const renderDescription = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Description</div>
      <div className="text-gray-600">{event.description}</div>
    </div>
  );

  /**
   * Renders the event type
   */
  const renderEventType = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Type</div>
      <div className="bg-yellow-100 text-yellow-800 inline-block px-2 py-1 rounded">
        {event.type}
      </div>
    </div>
  );

  /**
   * Renders the related sources
   */
  const renderRelatedSources = () => (
    <div>
      <div className="font-semibold text-gray-700 mb-2">Related Sources</div>
      <div className="flex flex-wrap gap-1">
        {event.relatedSources.map((source: string, i: number) => (
          <span key={i} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
            {source}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <BaseModal title={event.title} onClose={onClose}>
      {renderDateRange()}
      {renderDescription()}
      {renderEventType()}
      {renderRelatedSources()}
    </BaseModal>
  );
}; 