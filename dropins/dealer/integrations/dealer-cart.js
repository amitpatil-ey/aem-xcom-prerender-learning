import {
  getSelectedDealer,
} from '../context/dealer-context.js';

export function buildDealerAwareCartPayload(product) {
  const dealer = getSelectedDealer();

  return {
    sku: product.sku,
    quantity: 1,
    dealer,
  };
}