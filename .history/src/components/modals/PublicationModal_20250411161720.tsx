import React from 'react';
import { Publication } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { getTypeColor } from '@/utils/uiUtils';
import { BaseModal } from './BaseModal';

interface PublicationModalProps {
  publication: Publication;
  onClose: () => void;
}

/**
 * Modal component for displaying detailed information about a publication
 * @param publication - The publication to display
 * @param onClose - Function to call when the modal should be closed
 */
export const PublicationModal: React.FC<PublicationModalProps> = ({ publication, onClose }) => {
  /**
   * Renders the publication date
   */
  const renderDate = () => (
    <div className="text-gray-600 mb-3 text-sm">
      {formatDate(publication.ReleaseDate)} ({publication.DayOfWeek})
    </div>
  );

  /**
   * Renders a grid of publication details
   */
  const renderPublicationDetails = () => (
    <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded">
      <div>
        <div className="font-semibold text-gray-700 text-sm">Institution</div>
        <div className="text-gray-800">{publication.InstitutionName}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700 text-sm">Team</div>
        <div className="text-gray-800">{publication.TeamName}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700 text-sm">Content Team</div>
        <div className="text-gray-800">{publication.ContentTeam}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700 text-sm">Frequency</div>
        <div>
          <span className={`inline-block px-2 py-1 rounded text-white text-xs mt-1 ${getTypeColor(publication.FrequencyRelease)}`}>
            {publication.FrequencyRelease}
          </span>
        </div>
      </div>
      <div>
        <div className="font-semibold text-gray-700 text-sm">Primary Focus</div>
        <div className="text-gray-800 mt-1">{publication.PrimaryFocus}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700 text-sm">Released Last Year</div>
        <div className="text-gray-800 mt-1">
          <span className={`inline-block px-2 py-1 rounded text-xs ${publication.ReleasedLastYear ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {publication.ReleasedLastYear ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      <div>
        <div className="font-semibold text-gray-700 text-sm">Is Actual Data</div>
        <div className="mt-1">
          <span className={`inline-block px-2 py-1 rounded text-xs ${publication.IsActualData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {publication.IsActualData ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      <div>
        <div className="font-semibold text-gray-700 text-sm">Online Availability</div>
        <div className="mt-1">
          <span className={`inline-block px-2 py-1 rounded text-xs ${publication.OnlineAvailability ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
            {publication.OnlineAvailability ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );

  /**
   * Renders the publication tags
   */
  const renderTags = () => {
    if (!publication.KeywordTags || publication.KeywordTags.length === 0) return null;
    
    return (
      <div className="mb-2">
        <div className="font-semibold text-gray-700 mb-1 text-sm">Keywords</div>
        <div className="flex flex-wrap gap-1">
          {publication.KeywordTags.map((tag: string, i: number) => (
            <span key={i} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <BaseModal title={publication.PublicationTitle} onClose={onClose} size="compact">
      {renderDate()}
      {renderPublicationDetails()}
      {renderTags()}
    </BaseModal>
  );
}; 