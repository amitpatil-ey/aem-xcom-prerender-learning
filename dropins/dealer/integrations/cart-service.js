import { addProductsToCart, updateProductsFromCart } from '@dropins/storefront-cart/api.js';
import { getSelectedDealer } from '../context/dealer-context.js';

/*
|--------------------------------------------------------------------------
| Storage Keys
|--------------------------------------------------------------------------
|
| Two localStorage maps for dealer persistence:
|
| 1. cartItemDealers  — keyed by cart item UID (for cart-page updates)
| 2. cartSkuDealers   — keyed by product SKU  (for PDP → Cart bridge)
|
| The SKU map is the primary bridge: when a user selects a dealer on
| PDP and adds to cart, we save dealer→SKU. The cart page reads this
| back to display the dealer on the corresponding cart item.
|
| NOTE: entered_options with uid='dealer_id' is also injected into the
| addProductsToCart payload. If a matching customizable option or
| custom backend attribute exists, it will persist server-side too.
| Until then, localStorage is the client-side bridge.
|
*/

const CART_ITEM_DEALER_KEY = 'cartItemDealers';
const CART_SKU_DEALER_KEY = 'cartSkuDealers';

// ── helpers ──────────────────────────────────────────────────────────

function readMap(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function writeMap(key, map) {
  localStorage.setItem(key, JSON.stringify(map));
}

// ── Item UID based (cart-page updates) ───────────────────────────────

export function getCartItemDealerMap() {
  return readMap(CART_ITEM_DEALER_KEY);
}

export function getCartItemDealer(itemUid) {
  return readMap(CART_ITEM_DEALER_KEY)[itemUid] || null;
}

function saveCartItemDealer(itemUid, dealer) {
  const map = readMap(CART_ITEM_DEALER_KEY);
  if (dealer) {
    map[itemUid] = dealer;
  } else {
    delete map[itemUid];
  }
  writeMap(CART_ITEM_DEALER_KEY, map);
}

// ── SKU based (PDP → Cart bridge) ───────────────────────────────────

export function getDealerForSku(sku) {
  return readMap(CART_SKU_DEALER_KEY)[sku] || null;
}

function saveDealerForSku(sku, dealer) {
  const map = readMap(CART_SKU_DEALER_KEY);
  if (dealer) {
    map[sku] = dealer;
  } else {
    delete map[sku];
  }
  writeMap(CART_SKU_DEALER_KEY, map);
}

// ── Add to Cart (PDP) ───────────────────────────────────────────────

/**
 * Decorator/Wrapper Pattern:
 * Wraps the native addProductsToCart call to:
 * 1. Inject entered_options with dealer_id (forward-compatible with backend)
 * 2. Persist dealer→SKU in localStorage (client-side bridge to cart page)
 */
export async function addProductsToCartWithDealer(items, skuScope) {
  const selectedDealer = getSelectedDealer(skuScope);

  const enrichedItems = items.map((item) => {
    const itemPayload = { ...item };
    if (selectedDealer) {
      // Forward-compatible: if a custom backend attribute is added later,
      // this will start persisting server-side automatically.
      itemPayload.enteredOptions = [
        ...(itemPayload.enteredOptions || []),
        {
          uid: 'dealer_id',
          value: selectedDealer.id,
        },
      ];
    }
    return itemPayload;
  });

  const result = await addProductsToCart(enrichedItems);

  // Client-side bridge: save dealer by SKU so the cart page can read it
  if (selectedDealer) {
    items.forEach((item) => {
      const sku = item.sku || skuScope;
      if (sku && sku !== 'global') {
        saveDealerForSku(sku, selectedDealer);
      }
    });
  }

  return result;
}

// ── Update in Cart (PDP update mode) ────────────────────────────────

/**
 * Decorator/Wrapper Pattern:
 * Wraps the native updateProductsFromCart call to inject the selected dealer.
 */
export async function updateProductsFromCartWithDealer(items, skuScope) {
  const selectedDealer = getSelectedDealer(skuScope);

  const enrichedItems = items.map((item) => {
    const itemPayload = { ...item };
    if (selectedDealer) {
      itemPayload.enteredOptions = [
        ...(itemPayload.enteredOptions || []),
        {
          uid: 'dealer_id',
          value: selectedDealer.id,
        },
      ];
    }
    return itemPayload;
  });

  const result = await updateProductsFromCart(enrichedItems);

  // Also update the SKU map
  if (selectedDealer && skuScope && skuScope !== 'global') {
    saveDealerForSku(skuScope, selectedDealer);
  }

  return result;
}

// ── Cart Page Dealer Update ─────────────────────────────────────────

/**
 * Direct update for a cart item's dealer from the cart page drawer.
 *
 * LIMITATION: Standard Adobe Commerce updateCartItems mutation does NOT
 * support entered_options. Dealer is persisted client-side only (both
 * by itemUid and by SKU). A custom backend mutation is needed for
 * server-side persistence.
 */
export async function updateCartItemDealer(itemUid, currentQuantity, newDealer, itemSku) {
  console.warn(
    '[Dealer] updateCartItems does not support entered_options. '
    + 'Dealer stored client-side only. Backend custom mutation needed.',
  );

  // Save by item UID (primary key for cart-page lookups)
  saveCartItemDealer(itemUid, newDealer);

  // Also save by SKU (for consistency)
  if (itemSku) {
    saveDealerForSku(itemSku, newDealer);
  }

  // Call updateProductsFromCart for quantity sync (without entered_options)
  const itemPayload = {
    uid: itemUid,
    quantity: currentQuantity,
  };

  return updateProductsFromCart([itemPayload]);
}
