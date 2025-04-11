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
    <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded">
      <div>
        <div className="font-semibold text-gray-700 text-sm">Release Date</div>
        <div className="text-gray-800">{formatDate(event.ReleaseDate)}</div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700 text-sm">End Date</div>
        <div className="text-gray-800">{event.EventEndDate ? formatDate(event.EventEndDate) : 'Same day'}</div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700 text-sm">Focus Area</div>
        <div>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded inline-block mt-1">
            {event.PrimaryFocus}
          </span>
        </div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700 text-sm">Country</div>
        <div>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded inline-block mt-1">
            {event.CountryName}
          </span>
        </div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700 text-sm">Is Actual Data</div>
        <div>
          <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${event.IsActualData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {event.IsActualData ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      <div>
        <div className="font-semibold text-gray-700 text-sm">Frequency</div>
        <div className="text-gray-800 mt-1">{event.FrequencyRelease || 'N/A'}</div>
      </div>
    </div>
  );

  /**
   * Renders the event description
   */
  const renderDescription = () => (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-1 text-sm">Description</div>
      <div className="text-gray-600 text-sm bg-white border border-gray-100 p-3 rounded shadow-sm">
        {event.EventDescription || 'No description available'}
      </div>
    </div>
  );

  /**
   * Renders the related keywords/tags
   */
  const renderKeywords = () => {
    if (!event.KeywordsTags || event.KeywordsTags.length === 0) return null;
    
    return (
      <div className="mb-2">
        <div className="font-semibold text-gray-700 mb-1 text-sm">Keywords</div>
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
    <BaseModal title={event.EventTitle} onClose={onClose} size="compact">
      {renderEventDetails()}
      {renderDescription()}
      {renderKeywords()}
    </BaseModal>
  );
}; 