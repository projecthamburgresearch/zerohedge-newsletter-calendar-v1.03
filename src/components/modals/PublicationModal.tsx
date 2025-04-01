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
        <div className="font-semibold text-gray-700">Source</div>
        <div>{publication.source}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Domain</div>
        <div>{publication.domain}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Author</div>
        <div>{publication.author}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Newsletter Type</div>
        <div>
          <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${getTypeColor(publication.newsletterType)}`}>
            {publication.newsletterType}
          </span>
        </div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Primary Focus</div>
        <div>{publication.primaryFocus}</div>
      </div>
      <div>
        <div className="font-semibold text-gray-700">Previous Year</div>
        <div>{publication.previousYearReleased ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );

  /**
   * Renders the publication tags
   */
  const renderTags = () => {
    if (!publication.specificTags) return null;
    
    const tags = Array.isArray(publication.specificTags) 
      ? publication.specificTags 
      : (typeof publication.specificTags === 'string' 
          ? publication.specificTags.split(',').map((tag: string) => tag.trim())
          : []);
    
    if (tags.length === 0) return null;
    
    return (
      <div>
        <div className="font-semibold text-gray-700 mb-2">Tags</div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag: string, i: number) => (
            <span key={i} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <BaseModal title={publication.seriesTitle} onClose={onClose}>
      <div className="text-gray-600 mb-4">
        {formatDate(publication.date)} ({publication.dayOfWeek})
      </div>
      
      {renderPublicationDetails()}
      {renderTags()}
      
      <div className="text-sm text-gray-500">
        Internet Source Support: {publication.internetSourceSupport}
      </div>
    </BaseModal>
  );
}; 