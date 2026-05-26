/**
 * Creates the dealer CTA element.
 *
 * Renders either:
 * - "Select Dealer" button (when no dealer is selected)
 * - Selected dealer name + edit icon (when a dealer is selected)
 *
 * @param {Object|null} selectedDealer - Currently selected dealer, or null
 * @param {Function} onClick - Callback when CTA is clicked
 * @returns {HTMLElement} The CTA wrapper element
 */
export function createDealerCTA(selectedDealer, onClick) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dealer-cta';

  const button = document.createElement('button');

  if (selectedDealer) {
    const nameSpan = document.createElement('span');
    nameSpan.textContent = selectedDealer.name;

    const editIcon = document.createElement('span');
    editIcon.className = 'dealer-cta__edit-icon';
    editIcon.textContent = '✏️';
    editIcon.setAttribute('aria-label', 'Change dealer');

    button.appendChild(nameSpan);
    button.appendChild(editIcon);
  } else {
    button.textContent = 'Select Dealer';
  }

  button.addEventListener('click', onClick);

  wrapper.appendChild(button);

  return wrapper;
}
