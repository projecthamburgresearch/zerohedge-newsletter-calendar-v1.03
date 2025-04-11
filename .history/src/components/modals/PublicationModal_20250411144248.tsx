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
   * Renders a grid of publication details
   */
  const renderPublicationDetails = () => (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div className="font-semibold text-gray-700">Institution</div>
        <div>{publication.InstitutionName}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Team</div>
        <div>{publication.TeamName}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Content Team</div>
        <div>{publication.ContentTeam}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Frequency</div>
        <div>
          <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${getTypeColor(publication.FrequencyRelease)}`}>
            {publication.FrequencyRelease}
          </span>
        </div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Focus Area</div>
        <div>{publication.PrimaryFocus}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Released Last Year</div>
        <div>{publication.ReleasedLastYear ? 'Yes' : 'No'}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Is Actual Data</div>
        <div>{publication.IsActualData ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );

  /**
   * Renders the publication tags
   */
  const renderTags = () => {
    if (!publication.KeywordTags || publication.KeywordTags.length === 0) return null;
    
    return (
      <div>
        <div className="font-semibold text-gray-700 mb-2">Keywords</div>
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
    <BaseModal title={publication.PublicationTitle} onClose={onClose}>
      <div className="text-gray-600 mb-4">
        {formatDate(publication.ReleaseDate)} ({publication.DayOfWeek})
      </div>
      
      {renderPublicationDetails()}
      {renderTags()}
      
      <div className="text-sm text-gray-500">
        Online Availability: {publication.OnlineAvailability ? 'Available' : 'Not Available'}
      </div>
    </BaseModal>
  );
}; 