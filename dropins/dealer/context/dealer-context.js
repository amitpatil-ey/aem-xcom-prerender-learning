import {
  saveDealer,
  getSavedDealer,
} from '../services/dealer-storage.js';

let selectedDealer = getSavedDealer();

export function setSelectedDealer(dealer) {
  selectedDealer = dealer;
  saveDealer(dealer);
}

export function getSelectedDealer() {
  return selectedDealer;
}

export function hasSelectedDealer() {
  return !!selectedDealer;
}