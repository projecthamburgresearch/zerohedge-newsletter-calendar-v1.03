import { useEffect, useCallback } from 'react';

interface PopupPosition {
  left: number;
  top: number;
}

/**
 * Custom hook that manages the positioning of popup elements in the calendar.
 * Ensures popups stay within viewport bounds and follow mouse movement.
 */
export const usePopupPosition = () => {
  /**
   * Calculates the optimal position for a popup element based on mouse position and viewport size
   * @param e - Mouse event containing cursor position
   * @param popup - HTML element representing the popup
   * @returns Object containing left and top positions for the popup
   */
  const calculatePopupPosition = useCallback((e: MouseEvent, popup: HTMLElement): PopupPosition => {
    const rect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = e.clientX;
    let top = e.clientY + 20;

    /**
     * Adjusts the popup position to ensure it stays within viewport bounds
     */
    const adjustPositionForViewport = () => {
      if (left + rect.width > viewportWidth) {
        left = viewportWidth - rect.width - 20;
      }
      if (top + rect.height > viewportHeight) {
        top = viewportHeight - rect.height - 20;
      }
    };

    adjustPositionForViewport();
    return { left, top };
  }, []);

  useEffect(() => {
    /**
     * Updates the position of all visible popups on mouse movement
     * @param e - Mouse event containing cursor position
     */
    const updatePopupPosition = (e: MouseEvent) => {
      const popups = document.querySelectorAll('.group-hover\\:block');
      const updatePopupStyle = (popup: Element) => {
        if (popup instanceof HTMLElement && popup.style.display !== 'none') {
          const { left, top } = calculatePopupPosition(e, popup);
          popup.style.setProperty('--popup-x', `${left}px`);
          popup.style.setProperty('--popup-y', `${top}px`);
        }
      };
      popups.forEach(updatePopupStyle);
    };

    document.addEventListener('mousemove', updatePopupPosition);
    return () => document.removeEventListener('mousemove', updatePopupPosition);
  }, [calculatePopupPosition]);
}; 