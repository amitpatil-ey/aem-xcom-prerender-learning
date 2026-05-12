import {
  hasSelectedDealer,
} from '../context/dealer-context.js';

export function validateDealerSelection() {
  return hasSelectedDealer();
}