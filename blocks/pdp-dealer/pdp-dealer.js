import { loadCSS } from '../../scripts/aem.js';

/*
|--------------------------------------------------------------------------
| Dealer Dropin Styles
|--------------------------------------------------------------------------
|
| EDS auto-loads ONLY block CSS:
|   /blocks/pdp-dealer/pdp-dealer.css
|
| Dealer capability CSS is NOT block CSS.
| Therefore we must load it explicitly via loadCSS().
|
*/

export default async function decorate(block) {
  /*
  |--------------------------------------------------------------------------
  | Load Dealer Dropin CSS
  |--------------------------------------------------------------------------
  */

  await loadCSS('/dropins/dealer/styles/dealer.css');

  /*
  |--------------------------------------------------------------------------
  | Dynamic Imports (Absolute Paths)
  |--------------------------------------------------------------------------
  |
  | Absolute paths ensure correct module resolution regardless
  | of the current page URL. Relative paths would break on
  | product URLs like /products/foo/bar.
  |
  */

  const { initializeDealerDropin } = await import('/dropins/dealer/index.js');

  const { validateDealerSelection } = await import(
    '/dropins/dealer/services/dealer-validation.js'
  );

  const { emitDealerRequired } = await import(
    '/dropins/dealer/services/dealer-events.js'
  );

  const { buildDealerAwareCartPayload } = await import(
    '/dropins/dealer/integrations/dealer-cart.js'
  );

  /*
  |--------------------------------------------------------------------------
  | Context Detection
  |--------------------------------------------------------------------------
  |
  | When this block renders alongside product-details (on a real PDP),
  | we only render the dealer CTA — no duplicate product name or
  | add-to-cart button, since product-details already provides those.
  |
  | When standalone (e.g. dealer-test.html), we render the full
  | demo layout with mock product data.
  |
  */

  const isIntegrated = !!document.querySelector('.product-details');

  if (isIntegrated) {
    renderIntegratedMode(block, initializeDealerDropin);
  } else {
    renderStandaloneMode(
      block,
      initializeDealerDropin,
      validateDealerSelection,
      emitDealerRequired,
      buildDealerAwareCartPayload,
    );
  }
}

/*
|--------------------------------------------------------------------------
| Integrated Mode (alongside product-details on real PDP)
|--------------------------------------------------------------------------
|
| Renders only the dealer CTA and validation message.
| Product name, gallery, price, and add-to-cart are handled
| by the product-details block.
|
*/

function renderIntegratedMode(block, initializeDealerDropin) {
  block.innerHTML = `
    <div class="pdp-dealer-container pdp-dealer-container--integrated">
      <div class="dealer-section-label">Dealer Selection</div>
      <div class="dealer-dropin-container"></div>
      <div class="warning-message"></div>
    </div>
  `;

  const dealerContainer = block.querySelector('.dealer-dropin-container');
  initializeDealerDropin(dealerContainer);

  // Listen for dealer:required events (can be emitted by other blocks)
  const warningMessage = block.querySelector('.warning-message');
  document.addEventListener('dealer:required', () => {
    warningMessage.innerHTML = `
      <p>Please select a dealer before adding to cart.</p>
    `;
  });

  document.addEventListener('dealer:selected', () => {
    warningMessage.innerHTML = '';
  });
}

/*
|--------------------------------------------------------------------------
| Standalone Mode (dealer-test.html or isolated testing)
|--------------------------------------------------------------------------
|
| Renders the full demo layout with mock product data,
| its own add-to-cart button, and validation.
|
*/

function renderStandaloneMode(
  block,
  initializeDealerDropin,
  validateDealerSelection,
  emitDealerRequired,
  buildDealerAwareCartPayload,
) {
  const product = {
    sku: 'demo-product',
    name: 'Demo Product',
  };

  block.innerHTML = `
    <div class="pdp-dealer-container">

      <h1>${product.name}</h1>

      <div class="dealer-dropin-container"></div>

      <button class="add-to-cart-btn">
        Add To Cart
      </button>

      <div class="warning-message"></div>

    </div>
  `;

  const dealerContainer = block.querySelector('.dealer-dropin-container');
  initializeDealerDropin(dealerContainer);

  const addToCartBtn = block.querySelector('.add-to-cart-btn');
  const warningMessage = block.querySelector('.warning-message');

  addToCartBtn.addEventListener('click', () => {
    warningMessage.innerHTML = '';

    if (!validateDealerSelection()) {
      emitDealerRequired();

      warningMessage.innerHTML = `
        <p>
          Please select dealer before adding product to cart.
        </p>
      `;

      return;
    }

    const payload = buildDealerAwareCartPayload(product);

    console.log('Dealer Aware Cart Payload:', payload);
    alert('Product added to cart successfully');
  });

  document.addEventListener('dealer:selected', () => {
    warningMessage.innerHTML = '';
  });
}