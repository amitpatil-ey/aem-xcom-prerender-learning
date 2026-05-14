const STORAGE_KEY = 'selectedDealer';

export function saveDealer(dealer) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dealer));
}

export function getSavedDealer() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}

export function clearDealer() {
  localStorage.removeItem(STORAGE_KEY);
}