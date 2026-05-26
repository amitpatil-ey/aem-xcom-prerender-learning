export function getStorageKey(scope = 'global') {
  return `selectedDealer_${scope}`;
}

export function saveDealer(dealer, scope = 'global') {
  localStorage.setItem(getStorageKey(scope), JSON.stringify(dealer));
}

export function getSavedDealer(scope = 'global') {
  const data = localStorage.getItem(getStorageKey(scope));

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}

export function clearDealer(scope = 'global') {
  localStorage.removeItem(getStorageKey(scope));
}
