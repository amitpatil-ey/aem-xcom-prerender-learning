import { getDealersByPincode } from '../api/dealer-api.js';
import { createDealerList } from './dealer-list.js';
import { createDealerSearch } from './dealer-search.js';
import { setSelectedDealer } from '../context/dealer-context.js';
import { emitDealerSelected } from '../services/dealer-events.js';

/**
 * Creates the dealer selection drawer with overlay.
 *
 * Architecture notes:
 * - Appended to document.body (not inside the block)
 * - Uses overlay + slide-in panel pattern
 * - Overlay click closes the drawer
 * - Escape key closes the drawer
 * - Selecting a dealer closes the drawer and emits event
 *
 * @param {Function} onClose - Callback when drawer closes
 * @returns {{ overlay: HTMLElement, drawer: HTMLElement }} DOM elements
 */
export function createDealerDrawer(onClose) {
  /*
  |--------------------------------------------------------------------------
  | Overlay
  |--------------------------------------------------------------------------
  */

  const overlay = document.createElement('div');
  overlay.className = 'dealer-drawer-overlay';

  /*
  |--------------------------------------------------------------------------
  | Drawer Panel
  |--------------------------------------------------------------------------
  */

  const drawer = document.createElement('div');
  drawer.className = 'dealer-drawer';

  /*
  |--------------------------------------------------------------------------
  | Header
  |--------------------------------------------------------------------------
  */

  const header = document.createElement('div');
  header.className = 'dealer-drawer__header';

  const title = document.createElement('h3');
  title.className = 'dealer-drawer__title';
  title.textContent = 'Select a Dealer';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'dealer-drawer__close';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Close dealer drawer');

  header.appendChild(title);
  header.appendChild(closeBtn);

  /*
  |--------------------------------------------------------------------------
  | Body
  |--------------------------------------------------------------------------
  */

  const body = document.createElement('div');
  body.className = 'dealer-drawer__body';

  const listContainer = document.createElement('div');

  /*
  |--------------------------------------------------------------------------
  | Render Dealers
  |--------------------------------------------------------------------------
  */

  async function renderDealers(pincode = '') {
    listContainer.innerHTML = '';

    const loading = document.createElement('p');
    loading.className = 'dealer-list__loading';
    loading.textContent = 'Loading dealers…';
    listContainer.appendChild(loading);

    try {
      const dealers = await getDealersByPincode(pincode);

      listContainer.innerHTML = '';

      const dealerList = createDealerList(
        dealers,
        (dealer) => {
          setSelectedDealer(dealer);
          emitDealerSelected(dealer);
          closeDrawer();
        },
      );

      listContainer.appendChild(dealerList);
    } catch (error) {
      listContainer.innerHTML = '';

      const errorMsg = document.createElement('p');
      errorMsg.className = 'dealer-list__empty';
      errorMsg.textContent = 'Failed to load dealers. Please try again.';
      listContainer.appendChild(errorMsg);

      console.error('Dealer fetch error:', error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const search = createDealerSearch(renderDealers);

  body.appendChild(search);
  body.appendChild(listContainer);

  /*
  |--------------------------------------------------------------------------
  | Assemble Drawer
  |--------------------------------------------------------------------------
  */

  drawer.appendChild(header);
  drawer.appendChild(body);

  /*
  |--------------------------------------------------------------------------
  | Close Logic
  |--------------------------------------------------------------------------
  */

  function closeDrawer() {
    drawer.classList.remove('dealer-drawer--open');
    overlay.classList.remove('dealer-drawer-overlay--visible');

    // Wait for CSS transition to finish before removing from DOM
    setTimeout(() => {
      overlay.remove();
      drawer.remove();
    }, 350);

    document.removeEventListener('keydown', handleEscape);

    if (onClose) {
      onClose();
    }
  }

  function handleEscape(event) {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  }

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', handleEscape);

  /*
  |--------------------------------------------------------------------------
  | Mount & Animate In
  |--------------------------------------------------------------------------
  */

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  // Trigger CSS transition on next frame
  requestAnimationFrame(() => {
    overlay.classList.add('dealer-drawer-overlay--visible');
    drawer.classList.add('dealer-drawer--open');
  });

  // Load initial dealer list
  renderDealers();

  return { overlay, drawer };
}