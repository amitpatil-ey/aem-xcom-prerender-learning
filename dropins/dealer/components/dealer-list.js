import { createDealerCard } from './dealer-card.js';

/**
 * Creates a list of dealer cards.
 *
 * @param {Array} dealers - Array of dealer objects
 * @param {Function} onSelect - Callback when a dealer is selected
 * @returns {HTMLElement} The dealer list element
 */
export function createDealerList(dealers, onSelect) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dealer-list';

  if (!dealers || !dealers.length) {
    const empty = document.createElement('p');
    empty.className = 'dealer-list__empty';
    empty.textContent = 'No dealers found for this pincode.';
    wrapper.appendChild(empty);
    return wrapper;
  }

  dealers.forEach((dealer) => {
    wrapper.appendChild(
      createDealerCard(dealer, onSelect),
    );
  });

  return wrapper;
}