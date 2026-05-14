import {
  getSelectedDealer,
} from './context/dealer-context.js';

import {
  createDealerCTA,
} from './components/dealer-cta.js';

import {
  createDealerDrawer,
} from './components/dealer-drawer.js';

export function initializeDealerDropin(container) {
  function renderCTA() {
    container.innerHTML = '';

    const selectedDealer = getSelectedDealer();

    const cta = createDealerCTA(
      selectedDealer,
      openDrawer,
    );

    container.appendChild(cta);
  }

  function openDrawer() {
    const drawer = createDealerDrawer(() => {
      renderCTA();
    });

    document.body.appendChild(drawer);
  }

  renderCTA();

  document.addEventListener('dealer:selected', () => {
    renderCTA();
  });
}
