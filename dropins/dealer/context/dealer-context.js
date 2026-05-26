import {
  saveDealer,
  getSavedDealer,
} from '../services/dealer-storage.js';

// Map memory state per scope for runtime isolation
const selectedDealers = new Map();

export function setSelectedDealer(dealer, scope = 'global') {
  selectedDealers.set(scope, dealer);
  saveDealer(dealer, scope);
}

export function getSelectedDealer(scope = 'global') {
  if (!selectedDealers.has(scope)) {
    selectedDealers.set(scope, getSavedDealer(scope));
  }
  return selectedDealers.get(scope);
}

export function hasSelectedDealer(scope = 'global') {
  return !!getSelectedDealer(scope);
}
