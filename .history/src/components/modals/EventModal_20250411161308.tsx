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
   * Renders a grid of event details
   */
  const renderEventDetails = () => (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div className="font-semibold text-gray-700">Release Date</div>
        <div>{formatDate(event.ReleaseDate)}</div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700">End Date</div>
        <div>{event.EventEndDate ? formatDate(event.EventEndDate) : 'Same day'}</div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700">Focus Area</div>
        <div>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
            {event.PrimaryFocus}
          </span>
        </div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700">Country</div>
        <div>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {event.CountryName}
          </span>
        </div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700">Is Actual Data</div>
        <div>
          <span className={`inline-block px-2 py-1 rounded text-xs ${event.IsActualData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {event.IsActualData ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700">Frequency</div>
        <div>{event.FrequencyRelease || 'N/A'}</div>
      </div>
    </div>
  );

  /**
   * Renders the event description
   */
  const renderDescription = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2">Description</div>
      <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded">{event.EventDescription || 'No description available'}</div>
    </div>
  );

  /**
   * Renders the related keywords/tags
   */
  const renderKeywords = () => {
    if (!event.KeywordsTags || event.KeywordsTags.length === 0) return null;
    
    return (
      <div className="mb-2">
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
  };

  return (
    <BaseModal title={event.EventTitle} onClose={onClose}>
      {renderEventDetails()}
      {renderDescription()}
      {renderKeywords()}
    </BaseModal>
  );
}; 