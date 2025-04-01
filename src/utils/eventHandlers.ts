import { Publication, SpecialEvent } from '@/types';

/**
 * Handles popup position updates based on mouse movement
 */
export const handlePopupPosition = (event: MouseEvent) => {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => {
    if (popup instanceof HTMLElement) {
      const rect = popup.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      
      // Adjust position if popup would go off screen
      if (x + rect.width > window.innerWidth) {
        popup.style.left = `${window.innerWidth - rect.width}px`;
      } else {
        popup.style.left = `${x}px`;
      }
      
      if (y + rect.height > window.innerHeight) {
        popup.style.top = `${window.innerHeight - rect.height}px`;
      } else {
        popup.style.top = `${y}px`;
      }
    }
  });
};

/**
 * Handles hover events for publications
 */
export const handleHoverEvents = (
  setHoveredPublication: React.Dispatch<React.SetStateAction<{ source: string; date: string } | null>>,
  source: string,
  date: string,
  timeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>
) => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }
  setHoveredPublication({ source, date });
};

/**
 * Handles click events for publications
 */
export const handleClickEvents = (
  setSelectedPublication: React.Dispatch<React.SetStateAction<Publication | null>>,
  publication: Publication
) => {
  setSelectedPublication(publication);
};

/**
 * Handles mouse events for publications
 */
export const handleMouseEvents = (
  setHoveredPublication: React.Dispatch<React.SetStateAction<{ source: string; date: string } | null>>,
  timeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>
) => {
  timeoutRef.current = setTimeout(() => {
    setHoveredPublication(null);
  }, 200);
};

/**
 * Handles dropdown click events
 */
export const handleDropdownClick = (
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsDropdownOpen(prev => !prev);
};

/**
 * Handles modal close events
 */
export const handleModalClose = (
  setSelectedPublication: React.Dispatch<React.SetStateAction<Publication | null>>,
  setSelectedEvent: React.Dispatch<React.SetStateAction<SpecialEvent | null>>
) => {
  setSelectedPublication(null);
  setSelectedEvent(null);
};

/**
 * Handles clicks outside of a dropdown
 */
export const handleOutsideClick = (
  event: MouseEvent,
  dropdownRef: React.RefObject<HTMLDivElement>,
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    setIsDropdownOpen(false);
  }
}; 